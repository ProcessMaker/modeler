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
    @remove-node="$emit('remove-node', $event)"
    @add-node="$emit('add-node', $event)"
    @save-state="$emit('save-state', $event)"
  >
    <template v-slot:dropdown>
      <div class="dropdown-container">
        <button class="button" @click="dropdownOpen = !dropdownOpen">
          <i class="fas fa-cog"/>
        </button>

        <select v-if="dropdownOpen" class="dropdown" @change="$emit('replace-node', node, $event.target.value)">
          <option value=""/>
          <option value="processmaker-modeler-start-timer-event">Start Timer Event</option>
          <option value="processmaker-modeler-message-start-event">Message Start Event</option>
        </select></div>
    </template>
  </crown-config>
</template>

<script>
import portsConfig from '@/mixins/portsConfig';
import EventShape from './eventShape';
import hasMarkers from '@/mixins/hasMarkers';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import { startColor } from '@/components/nodeColors';
import CrownConfig from '@/components/crownConfig';
import highlightConfig from '@/mixins/highlightConfig';

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
  mixins: [highlightConfig, portsConfig, hasMarkers, hideLabelOnDrag],
  data() {
    return {
      shape: null,
      definition: null,
      dropdownOpen: true,
    };
  },
  watch: {
    'node.definition.name'(name) {
      this.shape.attr('label/text', name);
    },
  },
  mounted() {
    this.shape = new EventShape();
    this.shape.set('type', 'processmaker.components.nodes.startEvent.Shape');
    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.get('x'), bounds.get('y'));
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr({
      body: {
        stroke: '#00bf9c',
        fill: startColor,
        originalFill: startColor,
      },
      label: {
        text: this.node.definition.get('name'),
        refY: '130%',
      },
      image: {
        'ref-x': 5,
        'ref-y': 5,
        'width': bounds.get('width') - 10,
        'height': bounds.get('height') - 10,
      },
    });
    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>

<style scoped lang="scss">
  .dropdown-container {
    position: relative;
    display: flex;
    margin: 0 10px;

    .button {
      background: none;
      border: none;
      color: white;
      padding: 0;
    }

    .dropdown {
      position: absolute;
      left: 0;
      top: 2rem;
    }
  }
</style>
