<template>
  <div class="rail-container" data-cy="rail-bottom">
    <div
      class="rail-left"
      :style="[overlap ? { position: 'relative'} : { position: 'absolute' }]"
      id="rail-left-box"
    >
      <MiniPaperControl
        :paper-manager="paperManager"
        :graph="graph"
      />

      <ZoomControl
        :paper-manager="paperManager"
      />
    </div>

    <div
      class="rail-center"
      id="rail-center"
      :style="[overlap ? { width: 'auto'} : { width: '100%'}]"
    >
      <UndoRedoControl
        :is-rendering="isRendering"
        @load-xml="$emit('load-xml')"
        @clearSelection="$emit('clearSelection')"
        id="undo-redo-box"
      />

      <Controls
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
import Controls from '@/components/railBottom/controls/Controls.vue';

export default {
  components: {
    MiniPaperControl,
    ZoomControl,
    UndoRedoControl,
    Controls,
  },
  props: {
    paperManager: Object,
    graph: Object,
    isRendering: Boolean,
    nodeTypes: Array,
  },
  data() {
    return {
      overlap: false,
      initialWidthControl: 0,
      widthControlBox: 0,
      margin: 0,
    };
  },
  watch: {
    widthControlBox(newValue) {
      if (newValue < this.initialWidthControl) {
        // const ml = parseInt(getComputedStyle(document.getElementById('rail-center')).getPropertyValue('margin-left'), 10);
        // this.overlap = false;

        this.margin += 40;
        document.getElementById('rail-center').style.marginLeft = `-${this.margin}px`;
      }

      document.getElementById('rail-center').style.marginLeft = 0;


      // window.console.log(overlap);

      // if (overlap) {
      //   this.overlap = true;
      // }
    },
  },
  methods: {
    onCreateElementHandler(data){
      this.$emit('onCreateElement', data);
    },
    onSetCursorHandler(data) {
      this.$emit('set-cursor', data);
    },
    initObserver() {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0].target;
        this.widthControlBox = entry.getBoundingClientRect().width;

        const el1 = document.getElementById('rail-left-box');
        const el2 = document.getElementById('undo-redo-box');

        const domRect1 = el1.getBoundingClientRect();
        const domRect2 = el2.getBoundingClientRect();

        const overlap = !(
          domRect1.top > domRect2.bottom ||
          domRect1.right < domRect2.left ||
          domRect1.bottom < domRect2.top ||
          domRect1.left > domRect2.right
        );

        if (overlap) {
          window.console.log(overlap);
          debugger;
        }
      });

      observer.observe(this.$refs.controlBox.$el);
    },
  },
  async mounted() {
    await nextTick();
    // this.initialWidthControl = this.$refs.controlBox.$el.getBoundingClientRect().width;

    this.initObserver();
  },
};
</script>

<style lang="scss" scoped src="./railBottom.scss"></style>
