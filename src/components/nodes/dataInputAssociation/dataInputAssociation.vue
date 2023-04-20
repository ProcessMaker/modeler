<template>
  <crown-config
    :highlighted="highlighted"
    :paper="paper"
    :graph="graph"
    :shape="shape"
    :node="node"
    :nodeRegistry="nodeRegistry"
    :moddle="moddle"
    :collaboration="collaboration"
    :process-node="processNode"
    :plane-elements="planeElements"
    :is-rendering="isRendering"
    v-on="$listeners"
  />
</template>

<script>
import { shapes } from 'jointjs';
import linkConfig from '@/mixins/linkConfig';
import get from 'lodash/get';
import associationHead from '!!url-loader!@/assets/association-head.svg';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import { getOrFindDataInput, removeDataInput } from '@/components/crown/utils';
import { pull } from 'lodash';

export default {
  components: {
    CrownConfig,
  },
  props: [
    'graph',
    'node',
    'id',
    'highlighted',
    'nodeRegistry',
    'moddle',
    'paper',
    'collaboration',
    'processNode',
    'planeElements',
    'isRendering',
  ],
  mixins: [linkConfig],
  data() {
    return {
      shape: null,
      initialDataAssociationDirection: this.node.definition.dataAssociationDirection,
    };
  },
  computed: {
    isValidConnection() {
      const targetType = get(this.target, 'component.node.definition.$type');

      if (!targetType) {
        return false;
      }

      const dataStoreValidTargets = [
        'bpmn:Task',
        'bpmn:SubProcess',
        'bpmn:CallActivity',
        'bpmn:ManualTask',
        'bpmn:ScriptTask',
        'bpmn:ServiceTask',
      ];
      const dataObjectValidTargets = [
        'bpmn:Task',
        'bpmn:SubProcess',
        'bpmn:CallActivity',
        'bpmn:ManualTask',
        'bpmn:ScriptTask',
        'bpmn:ServiceTask',
        'bpmn:IntermediateThrowEvent',
        'bpmn:EndEvent',
      ];

      const sourceIsDataStore = this.sourceNode.definition.$type === 'bpmn:DataStoreReference';
      const sourceIsDataObject = this.sourceNode.definition.$type === 'bpmn:DataObjectReference';

      if (sourceIsDataStore && dataStoreValidTargets.includes(targetType)) {
        return true;
      }
      return (sourceIsDataObject && dataObjectValidTargets.includes(targetType));
    },
  },
  methods: {
    findSourceShape() {
      if (this.node.dataAssociationProps) {
        return this.node.dataAssociationProps.sourceShape;
      }
      const source = this.node.definition.sourceRef[0];
      // find shape
      const shape = this.graph.getElements().find(e=>e.component.node.definition === source);
      return shape;
    },
    getTargetRef() {
      if (this.node.dataAssociationProps) {
        return this.node.dataAssociationProps.targetCoords;
      }

      const taskWithInputAssociation = this.graph.getElements().find(element => {
        return element.component && element.component.node.definition.get('dataInputAssociations') &&
            element.component.node.definition.get('dataInputAssociations')[0] === this.node.definition;
      });

      return taskWithInputAssociation.component.node.definition;
    },
    updateRouter() {
      this.shape.router('normal', { elementPadding: this.elementPadding });
    },
    updateDefinitionLinks() {
      const targetShape = this.shape.getTargetElement();
      const dataInput = getOrFindDataInput(this.moddle, targetShape.component.node, this.sourceNode.definition);
      this.node.definition.set('targetRef', dataInput);
      // @todo Review why this needs to be and array. When saving the BPMN, if this is not an array the sourceRef is not stored
      this.node.definition.set('sourceRef', [this.sourceNode.definition]);
      targetShape.component.node.definition.set('dataInputAssociations', [this.node.definition]);
    },
  },
  mounted() {
    this.shape = new shapes.standard.Link({ router: { name: 'normal' } });
    this.shape.attr({
      line: {
        stroke: 'black',
        strokeWidth: '4',
        strokeLinecap: 'round',
        strokeDasharray: '1, 8',
        strokeDashoffset: '5',
        targetMarker: {
          'type': 'image',
          'xlink:href': associationHead,
          'width': 20,
          'height': 20,
          'y': -10,
        },
      },
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
  destroyed() {
    // when a association was not completed this.targetNode will be undefined
    if (!this.targetNode) {
      return;
    }
    removeDataInput(this.targetNode, this.sourceNode.definition);
    pull(this.targetNode.definition.get('dataInputAssociations'), this.node.definition);
  },
};
</script>
