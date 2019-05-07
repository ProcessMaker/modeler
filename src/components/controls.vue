<template>
  <b-card no-body>
    <b-card-header class="border-bottom-0">Controls</b-card-header>
    <b-input-group size="sm">
      <b-input-group-prepend>
        <span class="input-group-text"><i class="fas fa-filter"/></span>
      </b-input-group-prepend>

      <b-form-input ref="filter"
        :placeholder="`${$t('Filter')}...`"
        class="sticky-top"
        type="text"
        v-model="filterQuery"
      />
    </b-input-group>

    <b-list-group flush class="overflow-auto">
      <b-list-group-item v-for="(control, index) in controlItems"
        v-if="control.label.toLowerCase().includes(filterQuery.toLowerCase())"
        :key="index"
        class="control-item p-2 border-right-0"
        :data-test="control.type"
        @dragstart="$event.preventDefault()"
        @mousedown="startDrag($event, control.type)"
      >
        <div class="tool d-flex align-items-center">
          <div class="img-container text-break">
            <img :src="control.icon">
          </div>
          {{ $t(control.label) }}
        </div>
      </b-list-group-item>
    </b-list-group>

  </b-card>
</template>

<script>
export default {
  props: ['controls', 'allowDrop'],
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
      draggingControlType: null,
      xOffset: null,
      yOffset: null,
    };
  },
  computed: {
    controlItems() {
      return Object.values(this.controls).flat();
    },
  },
  methods: {
    startDrag(event, controlType) {
      const sourceElement = event.target;
      const duplicateElement = sourceElement.cloneNode(true);
      duplicateElement.classList.add('is-dragging');
      duplicateElement.classList.toggle('no-drop', !this.allowDrop);

      this.$root.$el.appendChild(duplicateElement);
      this.xOffset = event.clientX - sourceElement.getBoundingClientRect().left;
      this.yOffset = event.clientY - sourceElement.getBoundingClientRect().top;
      this.draggingElement = duplicateElement;
      this.draggingControlType = controlType;

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

      this.$root.$el.removeChild(this.draggingElement);
      this.draggingElement = null;
      this.draggingControlType = null;
    },
    dropElement({ clientX, clientY }) {
      this.$emit('handleDrop', { clientX, clientY, type: this.draggingControlType });
      this.stopDrag();
    },
    setDraggingPosition({ pageX, pageY, clientX, clientY }) {
      this.draggingElement.style.left = pageX - this.xOffset + 'px';
      this.draggingElement.style.top = pageY - this.yOffset + 'px';
      this.$emit('drag', { clientX, clientY, type: this.draggingControlType });
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

.img-container {
  pointer-events: none;
  margin-right: 8px;
  width: 32px;
  text-align: center;
}

</style>
