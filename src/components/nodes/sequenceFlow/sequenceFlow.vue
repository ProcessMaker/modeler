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
import { namePosition } from './sequenceFlowConfig';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import SequenceFlow from '@/components/nodes/genericFlow/SequenceFlow';

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
    };
  },
  computed: {
    isValidConnection() {
      return SequenceFlow.isValid({
        sourceShape: this.sourceShape,
        targetShape: this.target,
        targetConfig: this.targetConfig,
      });
    },
    targetType() {
      return get(this.target, 'component.node.type');
    },
    shapeName() {
      return this.node.definition.get('name');
    },
    nameLabel: {
      get() {
        return this.shape.label(0).attrs.text.text;
      },
      set(text = '') {
        this.shape.label(0, {
          attrs: {
            text: { text },
          },
        });
      },
    },
  },
  watch: {
    'node.definition': {
      handler() {
        const newNameLabel = this.shapeName;

        if (newNameLabel !== this.nameLabel) {
          this.nameLabel = newNameLabel;
        }
        this.setDefaultMarker(this.isDefaultFlow());
      },
      deep: true,
    },
    'node.definition.sourceRef': {
      handler() {
        this.setDefaultMarker(this.isDefaultFlow());
      },
      deep: true,
    },
  },
  methods: {
    setDefaultMarker(value) {
      this.shape.attr('line', {
        sourceMarker: {
          'stroke-width': value ? 2 : 0,
        },
      });
    },
    isDefaultFlow() {
      return this.node.definition.sourceRef
        && this.node.definition.sourceRef.default
        && this.node.definition.sourceRef.default.id === this.node.definition.id;
    },
    updateRouter() {
      this.shape.router('orthogonal', { padding: 1 });
    },
    updateDefinitionLinks() {
      const targetShape = this.shape.getTargetElement();

      this.node.definition.targetRef = targetShape.component.node.definition;
      this.sourceShape.component.node.definition.get('outgoing').push(this.node.definition);
      targetShape.component.node.definition.get('incoming').push(this.node.definition);
    },
    createLabel() {
      this.shape.labels([{
        attrs: {
          text: {
            text: this.shapeName,
          },
        },
        position: namePosition,
      }]);
    },
    createDefaultFlowMarker() {
      this.shape.attr('line', {
        sourceMarker: {
          'type': 'polyline',
          'stroke-width': this.isDefaultFlow() ? 2 : 0,
          points: '2,6 6,-6',
        },
      });
    },
  },
  mounted() {
    this.shape = new shapes.standard.Link();
    this.shape.connector('rounded', { radius: 5 });
    this.createLabel();
    this.createDefaultFlowMarker();

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
