<template>
  <b-col
    class="h-100 overflow-hidden controls-column"
    :class="[{ 'ignore-pointer': canvasDragPosition, 'controls-column-compressed' : compressed }]"
    data-test="controls-column"
  >
    <b-card no-body class="controls rounded-0 border-top-0 border-bottom-0 border-left-0" :style="{ height: parentHeight }">
      <b-list-group flush class="overflow-auto w-auto" :class="{ 'd-flex align-items-center': compressed }">
        <b-list-group-item
          tabindex="0"
          v-for="(control, index) in controls"
          :key="index"
          class="control-item border-right-0 flex-grow-1"
          :class="compressed ? 'p-0 pt-2 pb-2 w-100 d-flex justify-content-center' : 'p-2'"
          :data-test="control.type"
          @dragstart="$event.preventDefault()"
          @mousedown="startDrag($event, control)"
        >
          <div
            class="tool"
            :class="{ 'text-truncate ml-1': !compressed }"
            v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
            :title="$t(control.label)"
          >
            <img :src="control.icon" class="tool-icon" :alt="$t(control.label)">
            <span v-if="!compressed" class="ml-1">{{ $t(control.label) }}</span>
          </div>
        </b-list-group-item>
      </b-list-group>
    </b-card>
  </b-col>
</template>

<script>
import { BOTTOM } from '@/components/controls/rankConstants';

export default {
  props: ['allowDrop', 'compressed', 'canvasDragPosition', 'parentHeight', 'nodeTypes'],
  watch: {
    allowDrop(allowDrop) {
      if (this.draggingElement) {
        this.draggingElement.classList.toggle('no-drop', !allowDrop);
      }
    },
  },
  data() {
    return {
      draggingElement: null,
      draggingControl: null,
      xOffset: null,
      yOffset: null,
    };
  },
  computed: {
    controls() {
      return this.nodeTypes
        .filter(nodeType => nodeType.control)
        .map(nodeType => ({
          type: nodeType.id,
          icon: nodeType.icon,
          label: nodeType.label,
          bpmnType: nodeType.bpmnType,
          rank: nodeType.rank || BOTTOM,
        }))
        .sort((node1, node2) => node1.rank - node2.rank);
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

<style lang="scss" src="./controls.scss" scoped />
