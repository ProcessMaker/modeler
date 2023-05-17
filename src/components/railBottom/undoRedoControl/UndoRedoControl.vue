<template>
  <div class="ur-box">
    <button type="button"
      class="ur-button"
      data-cy="undo-control"
      :disabled="!canUndo"
      v-b-tooltip.hover
      :title="$t('Undo')"
      @click="undo"
    >
      <UndoIcon />
    </button>

    <div class="ur-divider" />

    <button type="button"
      class="ur-button"
      data-cy="redo-control"
      :disabled="!canRedo"
      v-b-tooltip.hover
      :title="$t('Redo')"
      @click="redo"
    >
      <RedoIcon />
    </button>
  </div>
</template>

<script>
import { UndoIcon, RedoIcon } from '@/components/railBottom/icons';
import undoRedoStore from '@/undoRedoStore';

export default ({
  components: {
    UndoIcon,
    RedoIcon,
  },
  props: {
    isRendering: {
      type: Boolean,
    },
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
