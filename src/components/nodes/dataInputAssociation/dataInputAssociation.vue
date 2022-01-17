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
      const targetType = get(this.target, 'component.node.type');

      if (!targetType) {
        return false;
      }

      /* A data input association can be connected to anything that isn't a data store or object or a start event */
      const invalidTarget = this.targetNode.isBpmnType('bpmn:DataObjectReference', 'bpmn:DataStoreReference', 'bpmn:StartEvent');

      if (invalidTarget) {
        return false;
      }

      return true;
    },
  },
  methods: {
    findSourceShape() {
      if (this.node.dataAssociationProps) {
        return this.node.dataAssociationProps.sourceShape;
      }

      const taskWithInputAssociation = this.graph.getElements().find(element => {
        return element.component && element.component.node.definition.get('dataInputAssociations') &&
            element.component.node.definition.get('dataInputAssociations')[0] === this.node.definition;
      });

      const dataObjectDefinition = taskWithInputAssociation.component.node.definition.get('dataInputAssociations')[0].sourceRef[0];

      return this.graph.getElements().find(element => {
        return element.component && element.component.node.definition === dataObjectDefinition;
      });
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
    removeDataInput(this.targetNode, this.sourceNode.definition);
    pull(this.targetNode.definition.get('dataInputAssociations'), this.node.definition);
  },
};
</script>
