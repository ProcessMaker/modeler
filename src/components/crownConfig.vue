<template>
  <div class="crown-config">
    <font-awesome-icon class="crown-config__icon" :icon="trashIcon" @click="removeShape()"/>
  </div>
</template>

<script>

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default {
  components: {
    FontAwesomeIcon,
  },
  props: ['graph', 'shape', 'node'],
  data() {
    return {
      trashIcon: faTrash,
      showCrown: false,
    };
  },
  methods: {
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
    height: 1.65rem;
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
