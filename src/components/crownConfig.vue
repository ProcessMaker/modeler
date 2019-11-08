<template>
  <div class="crown-config">
    <svg @click="addSequence()" class="crown-config__icon" width="19px" height="20px" viewBox="0 0 19 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="custom/connect-elements" transform="translate(-3.000000, -2.000000)" fill="#000000">
          <path fill="#fff"
            d="M18.5,20 L13,20 L13,5 L8,5 L8,7 L3,7 L3,2 L8,2 L8,4 L14,4 L14,19 L18.5,19 L18.5,17 L21.5,19.5 L18.5,22 L18.5,20 Z M4,3 L4,6 L7,6 L7,3 L4,3 Z"
            id="connect-elements"
          />
        </g>
      </g>
    </svg>
    <svg class="crown-config__icon" width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <font-awesome-icon class="crown-config__icon" :icon="trashIcon" @click="removeShape()"/>
  </div>
</template>

<script>

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

export default {
  components: {
    FontAwesomeIcon,
  },
  props: ['graph', 'shape', 'node', 'nodeRegistry', 'moddle', 't'],
  data() {
    return {
      trashIcon: faTrashAlt,
      showCrown: false,
    };
  },
  methods: {
    addSequence(cellView, evt, x, y) {
      //this.removeCrown();
      const sequenceFlowConfig = this.nodeRegistry['processmaker-modeler-sequence-flow'];
      const sequenceLink = sequenceFlowConfig.definition(this.moddle, this.t);
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
  },
};
</script>

<style lang="scss">
  $icon-color: #fff;
  $primary-color: #5096db;

  .crown-config {
    background-color: $primary-color;
    position: absolute;
    top: 10rem;
    right: 10rem;
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
