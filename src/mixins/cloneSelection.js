import { id as laneId } from '../components/nodes/poolLane/config';
import { id as sequenceFlowId } from '../components/nodes/sequenceFlow';
import { id as associationId } from '../components/nodes/association';
import { id as messageFlowId } from '../components/nodes/messageFlow/config';
import { id as dataOutputAssociationFlowId } from '../components/nodes/dataOutputAssociation/config';
import { id as dataInputAssociationFlowId } from '../components/nodes/dataInputAssociation/config';
import { id as genericFlowId } from '../components/nodes/genericFlow/config';
import { getOrFindDataInput, findIOSpecificationOwner } from '../components/crown/utils';

export default {
  methods: {
    cloneNodesSelection() {
      let clonedNodes = [], clonedFlows = [], clonedDataInputAssociations = [], clonedDataOutputAssociations = [];
      const nodes = this.highlightedNodes;
      const selector = this.$refs.selector.$el;
      const flowNodeTypes = [
        sequenceFlowId,
        laneId,
        associationId,
        messageFlowId,
        genericFlowId,
      ];
      const dataInputAssociationNodeTypes = [
        dataInputAssociationFlowId,
      ];
      const dataOutputAssociationNodeTypes = [
        dataOutputAssociationFlowId,
      ];

      if (typeof selector.getBoundingClientRect === 'function') {
        nodes.forEach(node => {
          if (flowNodeTypes.includes(node.type)) {
            const clonedFlow = this.cloneFlowAndSetNewId(node);
            clonedFlows.push(clonedFlow);
            clonedNodes.push(clonedFlow);
          } else if (dataInputAssociationNodeTypes.includes(node.type)) {
            const clonedFlow = this.cloneFlowAndSetNewId(node);
            clonedDataInputAssociations.push(clonedFlow);
            clonedNodes.push(clonedFlow);
          } else if (dataOutputAssociationNodeTypes.includes(node.type)) {
            const clonedFlow = this.cloneFlowAndSetNewId(node);
            clonedDataOutputAssociations.push(clonedFlow);
            clonedNodes.push(clonedFlow);
          } else {
            const clonedElement = this.cloneElementAndCalculateOffset(node);
            clonedNodes.push(clonedElement);
          }
        });
      }

      this.connectClonedFlows(clonedFlows, clonedNodes);
      this.connectClonedDataInputAssociations(clonedDataInputAssociations, clonedNodes);
      this.connectClonedDataOutputAssociations(clonedDataOutputAssociations, clonedNodes);

      return clonedNodes;
    },
    // Returns the Flow Element (Task| DataStore| DataObject)  that is the target of the association
    getDataInputOutputAssociationTargetRef(association) {
      if (association.targetRef.$type === 'bpmn:DataInput') {
        const ioSpec = association.targetRef.$parent;
        return findIOSpecificationOwner(ioSpec, this);
      }
      if (association.targetRef.$type === 'bpmn:DataInputAssociation') {
        const ioSpec = association.targetRef.$parent;
        return findIOSpecificationOwner(ioSpec, this);
      }
      return association.targetRef;
    },
    cloneFlowAndSetNewId(node) {
      const clonedFlow = node.cloneFlow(this.nodeRegistry, this.moddle, this.$t);
      clonedFlow.setIds(this.nodeIdGenerator);
      return clonedFlow;
    },
    cloneElementAndCalculateOffset(node) {
      const clonedElement = node.clone(this.nodeRegistry, this.moddle, this.$t);
      const { height: selectorHeight } = this.$refs.selector.$el.getBoundingClientRect();
      const { sy } = this.paper.scale();
      const yOffset = selectorHeight / sy;
      clonedElement.diagram.bounds.y += yOffset;
      clonedElement.setIds(this.nodeIdGenerator);
      return clonedElement;
    },
    connectClonedFlows(clonedFlows, clonedNodes) {
      clonedFlows.forEach(clonedFlow => {
        const originalFlow = this.nodes.find(node => node.definition.id === clonedFlow.cloneOf);
        const src = originalFlow.definition.sourceRef;
        const target = originalFlow.definition.targetRef;
        const srcClone = clonedNodes.find(node => node.cloneOf === src.id);
        const targetClone = clonedNodes.find(node => node.cloneOf === target.id);
        if (!srcClone || !targetClone) {
          clonedNodes.splice(clonedNodes.indexOf(clonedFlow), 1);
          return;
        }
        clonedFlow.definition.set('sourceRef', srcClone.definition);
        clonedFlow.definition.set('targetRef', targetClone.definition);

        if (srcClone.definition.outgoing) {
          srcClone.definition.outgoing.push(clonedFlow.definition);
        } else {
          srcClone.definition.set('outgoing', [clonedFlow.definition]);
        }

        if (targetClone.definition.incoming) {
          targetClone.definition.incoming.push(clonedFlow.definition);
        } else {
          targetClone.definition.set('incoming', [clonedFlow.definition]);
        }

        clonedFlow.diagram.waypoint.forEach(point => {
          const { height: selectorHeight } = this.$refs.selector.$el.getBoundingClientRect();
          point.y += selectorHeight;
        });
      });
    },
    connectClonedDataInputAssociations(clonedDataInputAssociations, clonedNodes) {
      clonedDataInputAssociations.forEach(clonedAssociation => {
        const originalAssociation = this.nodes.find(node => node.definition.id === clonedAssociation.cloneOf);
        const src = originalAssociation.definition.sourceRef[0];
        const srcClone = clonedNodes.find(node => node.cloneOf === src.id);
        const originalTargetElement = this.getDataInputOutputAssociationTargetRef(originalAssociation.definition);
        const clonedElement = clonedNodes.find(node => node.cloneOf === originalTargetElement.id);
        const clonedDataInput = getOrFindDataInput(this.moddle, clonedElement, srcClone.definition);

        clonedAssociation.definition.set('sourceRef', [srcClone.definition]);
        clonedAssociation.definition.set('targetRef', clonedDataInput);
        clonedElement.definition.set('dataInputAssociations', [clonedAssociation.definition]);
      });
    },
    connectClonedDataOutputAssociations(clonedDataOutputAssociations, clonedNodes) {
      clonedDataOutputAssociations.forEach(clonedAssociation => {
        const originalAssociation = this.nodes.find(node => node.definition.id === clonedAssociation.cloneOf);
        const src = originalAssociation.definition.sourceRef || originalAssociation.definition.$parent;
        const target = originalAssociation.definition.targetRef;
        const srcClone = clonedNodes.find(node => node.cloneOf === src.id);
        const targetClone = clonedNodes.find(node => node.cloneOf === target.id);

        clonedAssociation.definition.set('targetRef', targetClone.definition);
        clonedAssociation.definition.set('sourceRef', srcClone.definition);

        const existingOutputAssociations = srcClone.definition.get('dataOutputAssociations') || [];
        srcClone.definition.set('dataOutputAssociations', [...existingOutputAssociations, clonedAssociation.definition]);
      });
    },
  },
};
