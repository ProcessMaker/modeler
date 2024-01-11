<template>
  <div class="rail-container" data-cy="rail-bottom">
    <div
      class="rail-left"
      :style="[overlap ? { position: 'relative'} : { position: 'absolute' }]"
      ref="railLeftBox"
    >
      <MiniPaperControl
        :class="{'hidden-opacity': showComponent === false}"
        :paper-manager="paperManager"
        :graph="graph"
      />

      <ZoomControl
        :paper-manager="paperManager"
        ref="zoomBox"
      />
      
      <PanControl
        @set-pan-mode="$emit('set-pan-mode', $event)"
        :pan-mode="panMode"
      />
    </div>

    <div
      class="rail-center"
      :style="[overlap ? { width: 'auto'} : { width: '100%'}]"
    >
      <UndoRedoControl
        v-if="!isMultiplayer"
        v-show="showComponent"
        :is-rendering="isRendering"
        @load-xml="$emit('load-xml')"
        @clearSelection="$emit('clearSelection')"
        ref="undoRedoBox"
      />

      <Controls
        v-show="showComponent"
        :nodeTypes="nodeTypes"
        @onCreateElement="onCreateElementHandler"
        @onSetCursor="onSetCursorHandler"
        ref="controlBox"
      />
    </div>
  </div>
</template>

<script>
import { nextTick } from 'vue';
import MiniPaperControl from '@/components/railBottom/miniPaperControl/MiniPaperControl.vue';
import ZoomControl from '@/components/railBottom/zoomControl/ZoomControl.vue';
import UndoRedoControl from '@/components/railBottom/undoRedoControl/UndoRedoControl.vue';
import PanControl from './PanControl.vue';
import Controls from '@/components/railBottom/controls/Controls.vue';
import store from '@/store';

export default {
  components: {
    MiniPaperControl,
    PanControl,
    ZoomControl,
    UndoRedoControl,
    Controls,
  },
  props: {
    paperManager: Object,
    graph: Object,
    isRendering: Boolean,
    nodeTypes: Array,
    panMode: Boolean,
  },
  data() {
    return {
      overlap: false,
      widthOverlapControl: 0,
      leftOverlapUndoRedo: 0,
      controlObserver: null,
    };
  },
  created() {
    this.controlObserver = new ResizeObserver(this.onControlObserver);
  },
  methods: {
    onCreateElementHandler(data){
      this.$emit('onCreateElement', data);
    },
    onSetCursorHandler(data) {
      this.$emit('set-cursor', data);
    },
    onControlObserver(entries) {
      // Control coordinates
      const controlEl = entries[0].target.getBoundingClientRect();
      // Zoom coordinates
      const zoomEl = this.$refs.zoomBox?.$el.getBoundingClientRect();
      // Undo/Redo coordinates
      const undoRedoEl = this.$refs.undoRedoBox?.$el.getBoundingClientRect();

      // Checks overlapping
      if (this.overlap && undoRedoEl) {
        if (controlEl.width < this.widthOverlapControl) {
          // Get the computed styles of the ZoomControl
          const zoomStyles = window.getComputedStyle(this.$refs.zoomBox.$el);
          // Calculate the total padding of the ZoomControl element
          const zoomPadding = parseInt(zoomStyles.paddingLeft, 10) + parseInt(zoomStyles.paddingRight, 10);
          // Get the computed styles of the RailLeftBox
          const railLeftBoxStyles = window.getComputedStyle(this.$refs.railLeftBox);
          // Calculate the total padding of the RailLeftBox element
          const railLeftBoxPadding = parseInt(railLeftBoxStyles.paddingLeft, 10) + parseInt(railLeftBoxStyles.paddingRight, 10);
          // Calculate the left position of the Controls element when it is overlapped with the UndoRedoControl and ZoomControl elements
          const vLeft = this.leftOverlapUndoRedo + (this.widthOverlapControl - controlEl.width) - zoomPadding - railLeftBoxPadding;
          // Checks if the left position of the Controls element when it is overlapped with the
          // UndoRedoControl and ZoomControl elements is greater than the right position of the ZoomControl element
          if (vLeft > zoomEl.right) {
            this.overlap = false;
          }
        }
      } else if (undoRedoEl?.left < zoomEl?.right) {
        this.overlap = true;
        this.widthOverlapControl = controlEl.width;
        this.leftOverlapUndoRedo = undoRedoEl.left;
      }
    },
  },
  computed: {
    showComponent() {
      return store.getters.showComponent;
    },
    isMultiplayer: () => store.getters.isMultiplayer,
  },
  async mounted() {
    await nextTick();

    this.controlObserver.observe(this.$refs.controlBox.$el);
  },
};
</script>

<style lang="scss" scoped src="./railBottom.scss"></style>
