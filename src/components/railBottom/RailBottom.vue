<template>
  <div class="rail-container" data-cy="rail-bottom">
    <div class="rail-left">
      <MiniPaperControl />

      <ZoomControl
        :paper-manager="paperManager"
      />
    </div>

    <div class="rail-center">
      <UndoRedoControl
        :is-rendering="isRendering"
        @load-xml="$emit('load-xml')"
        @clearSelection="$emit('clearSelection')"
      />

      <Controls />
    </div>
  </div>
</template>

<script>
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
  },
};
</script>

<style lang="scss" scoped src="./railBottom.scss"></style>
