<template>
  <b-card no-body class="controls">
    <b-input-group size="sm" v-show="!panelsCompressed">
      <b-input-group-prepend>
        <span class="input-group-text border-left-0 border-top-0 rounded-0"><i class="fas fa-filter" /></span>
      </b-input-group-prepend>

      <b-form-input ref="filter"
        :placeholder="`${$t('Filter Controls')}`"
        class="border-top-0 border-right-0 rounded-0"
        type="text"
        v-model="filterQuery"
      />
    </b-input-group>

    <b-list-group flush class="overflow-auto w-auto">
      <b-list-group-item v-for="(control, index) in controlItems"
        :key="index"
        class="control-item border-right-0 flex-grow-1"
        :class="{ 'p-2': !panelsCompressed }"
        :data-test="control.type"
        @dragstart="$event.preventDefault()"
        @mousedown="startDrag($event, control)"
      >
        <div class="tool" :class="{ 'text-truncate ml-1': !panelsCompressed }" v-b-tooltip.hover.viewport.d50 :title="$t(control.label)">
          <img :src="control.icon" class="tool-icon mr-1">
          {{ !panelsCompressed ? $t(control.label) : '' }}
        </div>
      </b-list-group-item>
    </b-list-group>

  </b-card>
</template>

<script>
import flatten from 'lodash/flatten';

export default {
  props: ['controls', 'allowDrop', 'panelsCompressed'],
  watch: {
    allowDrop(allowDrop) {
      if (this.draggingElement) {
        this.draggingElement.classList.toggle('no-drop', !allowDrop);
      }
    },
  },
  data() {
    return {
      filterQuery: '',
      draggingElement: null,
      draggingControl: null,
      xOffset: null,
      yOffset: null,
    };
  },
  computed: {
    controlItems() {
      return flatten(Object.values(this.controls))
        .filter(control => control.label.toLowerCase().includes(this.filterQuery.toLowerCase()));
    },
  },
  methods: {
    startDrag(event, control) {
      const sourceElement = event.target;
      const duplicateElement = sourceElement.cloneNode(true);
      duplicateElement.classList.add('is-dragging');
      duplicateElement.classList.toggle('no-drop', !this.allowDrop);

      document.body.appendChild(duplicateElement);
      this.xOffset = event.clientX - sourceElement.getBoundingClientRect().left;
      this.yOffset = event.clientY - sourceElement.getBoundingClientRect().top;
      this.draggingElement = duplicateElement;
      this.draggingControl = control;

      document.addEventListener('mousemove', this.setDraggingPosition);
      document.addEventListener('mouseup', this.dropElement);
      document.addEventListener('keyup', this.stopDrag);

      this.setDraggingPosition(event);
    },
    stopDrag(event) {
      if (event && event.key !== 'Escape') {
        return;
      }

      document.removeEventListener('mousemove', this.setDraggingPosition);
      document.removeEventListener('mouseup', this.dropElement);
      document.removeEventListener('keyup', this.stopDrag);

      document.body.removeChild(this.draggingElement);
      this.draggingElement = null;
      this.draggingControl = null;
    },
    dropElement({ clientX, clientY }) {
      this.$emit('handleDrop', { clientX, clientY, control: this.draggingControl });
      this.stopDrag();
    },
    setDraggingPosition({ pageX, pageY, clientX, clientY }) {
      this.draggingElement.style.left = pageX - this.xOffset + 'px';
      this.draggingElement.style.top = pageY - this.yOffset + 'px';
      this.$emit('drag', { clientX, clientY, control: this.draggingControl });
    },
  },
};
</script>

<style lang="scss">
.card-header {
  background: #f7f7f7;
}

.list-group-item:first-child {
  border-top: 0;
}

.tool {
  cursor: grab;
  user-select: none;
  font-size: 0.875rem;
}

.is-dragging {
  background: #3397e1;
  color: white;
  position: absolute;
  z-index: 10;
  box-shadow: 5px 5px 8px 0px #0000004a;
  cursor: grabbing;
  padding: 0.5rem;

  &.no-drop {
    opacity: 0.8;
    cursor: no-drop;
  }

  &:hover {
    background-color: #3397e1;
    color: white;
  }
}

.tool-icon {
  width: 1.5rem;
  pointer-events: none;
}
</style>
