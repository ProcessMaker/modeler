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

      /* A data association can only be connected to a data store or data object */
      const invalidIncoming = this.targetConfig.bpmnType !== 'bpmn:DataObjectReference' &&
          this.targetConfig.bpmnType !== 'bpmn:DataStoreReference';

      if (invalidIncoming) {
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

      return this.graph.getElements().find(element => {
        return element.component && element.component.node.definition.get('dataOutputAssociations') &&
            element.component.node.definition.get('dataOutputAssociations').includes(this.node.definition);
      });
    },
    updateRouter() {
      this.shape.router('normal', { elementPadding: this.elementPadding });
    },
    updateDefinitionLinks() {
      this.node.definition.set('targetRef', this.targetNode.definition);
      const existingOutputAssociations = this.sourceNode.definition.get('dataOutputAssociations') || [];
      this.sourceNode.definition.set('dataOutputAssociations', [...existingOutputAssociations, this.node.definition]);
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
    pull(this.sourceNode.definition.get('dataOutputAssociations'), this.node.definition);
  },
};
</script>
