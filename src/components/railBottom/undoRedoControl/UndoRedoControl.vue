<template>
  <div class="ur-box">
    <button type="button"
      class="ur-button"
      data-cy="undo-control"
      :disabled="!canUndo"
      v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
      :title="$t('Undo')"
      @click="undo"
    >
      <inline-svg :src="undoIcon" />
    </button>

    <button type="button"
      class="ur-button"
      data-cy="redo-control"
      :disabled="!canRedo"
      v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
      :title="$t('Redo')"
      @click="redo"
    >
      <inline-svg :src="redoIcon" />
    </button>
  </div>
</template>

<script>
import InlineSvg from 'vue-inline-svg';
import undoRedoStore from '@/undoRedoStore';

export default ({
  components: {
    InlineSvg,
  },
  props: {
    isRendering: {
      type: Boolean,
    },
  },
  data() {
    return {
      undoIcon: require('@/assets/railBottom/undo.svg'),
      redoIcon: require('@/assets/railBottom/redo.svg'),
    };
  },
  watch: {
    canUndo(canUndo) {
      if (!canUndo) {
        this.$root.$emit('bv::hide::tooltip');
      }
    },
    canRedo(canRedo) {
      if (!canRedo) {
        this.$root.$emit('bv::hide::tooltip');
      }
    },
  },
  computed: {
    canUndo() {
      return undoRedoStore.getters.canUndo;
    },
    canRedo() {
      return undoRedoStore.getters.canRedo;
    },
  },
  methods: {
    undo() {
      this.$emit('clearSelection');
      if (this.isRendering) {
        return;
      }
      undoRedoStore
        .dispatch('undo')
        .then(() => this.$emit('load-xml'));
    },
    redo() {
      this.$emit('clearSelection');
      if (this.isRendering) {
        return;
      }
      undoRedoStore
        .dispatch('redo')
        .then(() => this.$emit('load-xml'));
    },
  },
});
</script>

<style lang="scss" scoped src="./undoRedoControl.scss"></style>
