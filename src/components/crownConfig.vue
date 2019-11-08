<template>
  <div class="crown-config" :style="style" v-if="showCrown">
    <svg @click="addSequence()"
      class="crown-config__icon"
      v-b-tooltip.hover.viewport.d50
      :title="$t('Sequence Flow')"
      width="19px"
      height="20px"
      viewBox="0 0 19 20"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="custom/connect-elements" transform="translate(-3.000000, -2.000000)" fill="#000000">
          <path fill="#fff"
            d="M18.5,20 L13,20 L13,5 L8,5 L8,7 L3,7 L3,2 L8,2 L8,4 L14,4 L14,19 L18.5,19 L18.5,17 L21.5,19.5 L18.5,22 L18.5,20 Z M4,3 L4,6 L7,6 L7,3 L4,3 Z"
            id="connect-elements"
          />
        </g>
      </g>
    </svg>
    <svg
      @click="addMessageFlow()"
      class="crown-config__icon"
      v-b-tooltip.hover.viewport.d50
      :title="$t('Message Flow')"
      width="19"
      height="20"
      viewBox="0 0 19 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0)">
        <circle cx="2.5" cy="2.5" r="2" stroke="#fff"/>
        <path d="M15.5 20L15.5 17.5V15L18.5 17.5L15.5 20Z" fill="#fff"/>
        <line x1="4" y1="2.5" x2="7" y2="2.5" stroke="#fff"/>
        <line x1="8" y1="2.5" x2="11" y2="2.5" stroke="#fff"/>
        <line x1="10.5" y1="5" x2="10.5" y2="2" stroke="#fff"/>
        <line x1="10.5" y1="9" x2="10.5" y2="6" stroke="#fff"/>
        <line x1="10.5" y1="13" x2="10.5" y2="10" stroke="#fff"/>
        <line x1="10.5" y1="17" x2="10.5" y2="14" stroke="#fff"/>
        <line x1="10" y1="17.5" x2="13" y2="17.5" stroke="#fff"/>
        <line x1="14" y1="17.5" x2="17" y2="17.5" stroke="#fff"/>
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="19" height="20" fill="white"/>
        </clipPath>
      </defs>
    </svg>
    <svg
      @click="removeShape()"
      class="crown-config__icon svg-inline--fa fa-trash-alt fa-w-14"
      v-b-tooltip.hover.viewport.d50
      :title="$t('Delete')"
      aria-hidden="true"
      data-prefix="fas"
      data-icon="trash-alt"
      role="img"
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
    >
      <path fill="#fff" d="M0 84V56c0-13.3 10.7-24 24-24h112l9.4-18.7c4-8.2 12.3-13.3 21.4-13.3h114.3c9.1 0 17.4 5.1 21.5 13.3L312 32h112c13.3 0 24 10.7 24 24v28c0 6.6-5.4 12-12 12H12C5.4 96 0 90.6 0 84zm416 56v324c0 26.5-21.5 48-48 48H80c-26.5 0-48-21.5-48-48V140c0-6.6 5.4-12 12-12h360c6.6 0 12 5.4 12 12zm-272 68c0-8.8-7.2-16-16-16s-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208zm96 0c0-8.8-7.2-16-16-16s-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208zm96 0c0-8.8-7.2-16-16-16s-16 7.2-16 16v224c0 8.8 7.2 16 16 16s16-7.2 16-16V208z"/>
    </svg>
  </div>
</template>

<script>

import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

export default {
  props: ['paper', 'graph', 'shape', 'node', 'nodeRegistry', 'moddle'],
  data() {
    return {
      trashIcon: faTrashAlt,
      showCrown: true,
    };
  },
  created() {
    this.$t = this.$t.bind(this);
  },
  computed: {
    style() {
      const { x, y, width } = this.shape.findView(this.paper).getBBox();
      return 'top:' +  (y - 45) + 'px;left:' + (x + width - 20) + 'px;cursor:pointer';
    },
    shapeView() {
      return this.shape.findView(this.paper);
    },
  },
  methods: {
    addSequence(cellView, evt, x, y) {
      this.removeCrown();
      const sequenceFlowConfig = this.nodeRegistry['processmaker-modeler-sequence-flow'];
      const sequenceLink = sequenceFlowConfig.definition(this.moddle, this.$t);
      sequenceLink.set('sourceRef', this.node.definition);
      sequenceLink.set('targetRef', { x, y });

      if (
        sequenceLink.sourceRef.$type === 'bpmn:ExclusiveGateway' ||
        sequenceLink.sourceRef.$type === 'bpmn:InclusiveGateway') {
        sequenceLink.conditionExpression = this.moddle.create('bpmn:FormalExpression', {
          body: '',
        });
      }

      this.$emit('add-node', {
        type: 'processmaker-modeler-sequence-flow',
        definition: sequenceLink,
        diagram: sequenceFlowConfig.diagram(this.moddle),
      });
    },
    addMessageFlow(cellView, evt, x, y) {
      this.removeCrown();

      const messageFlowDefinition = this.moddle.create('bpmn:MessageFlow', {
        name: '',
        sourceRef: this.shape.component.node.definition,
        targetRef: { x, y },
      });

      this.$emit('add-node', {
        type: 'processmaker-modeler-message-flow',
        definition: messageFlowDefinition,
        diagram: this.moddle.create('bpmndi:BPMNEdge'),
      });
    },
    removeShape() {
      this.graph.getConnectedLinks(this.shape).forEach(shape => this.$emit('remove-node', shape.component.node));
      this.shape.getEmbeddedCells({ deep: true }).forEach(cell => {
        if (cell.component) {
          this.graph.getConnectedLinks(cell).forEach(shape => this.$emit('remove-node', shape.component.node));
          this.shape.unembed(cell);
          this.$emit('remove-node', cell.component.node);
        }
      });

      this.$emit('remove-node', this.node);
    },
    removeCrown() {
      this.showCrown = false;
    },
  },
};
</script>

<style lang="scss">
  $icon-color: #fff;
  $primary-color: #5096db;

  .crown-config {
    background-color: $primary-color;
    position: absolute;
    z-index: 5;
    display: flex;
    justify-content: center;
    width: auto;
    height: 1.85rem;
    border-radius: 5px;

    &::after {
      background-color: $primary-color;
      content: '';
      width: 1.25rem;
      height: 1.25rem;
      position: absolute;
      top: 0.75rem;
      left: 0.45rem;
      z-index: -1;
      transform: rotate(45deg);
      border-radius: 1px;
    }

    &__icon {
      margin: 5px 10px;
      font-size: 1rem;
      color: $icon-color;
    }
  }
</style>
