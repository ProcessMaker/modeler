<template>
  <div class="rail-container">
    <div class="rail-left">
      <MiniPaperControl />

      <ZoomControl />
    </div>

    <div class="rail-center">
      <UndoRedoControl />

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
};
</script>

<style lang="scss" scoped src="./railBottom.scss"></style>
