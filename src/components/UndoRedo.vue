<template>
  <div class="btn-group btn-group-sm mr-2" role="group" aria-label="Undo/redo controls">
    <b-button
      class="btn btn-sm btn-secondary btn-undo"
      :disabled="!canUndo"
      data-test="undo"
      v-b-tooltip.hover
      :title="$t('Undo')"
      @click="undo"
    >
      <font-awesome-icon :icon="undoIcon" />
    </b-button>

    <b-button
      class="btn btn-sm btn-secondary btn-redo"
      :disabled="!canRedo"
      data-test="redo"
      v-b-tooltip.hover
      :title="$t('Redo')"
      @click="redo"
    >
      <font-awesome-icon :icon="redoIcon" />
    </b-button>
  </div>
</template>
<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faRedo, faUndo } from '@fortawesome/free-solid-svg-icons';
import undoRedoStore from '@/undoRedoStore';

export default {
  name: 'undo-redo',
  components: {
    FontAwesomeIcon,
  },
  props: {
    isRendering: {
      type: Boolean,
    },
  },
  data() {
    return {
      undoIcon: faUndo,
      redoIcon: faRedo,
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
      if (this.isRendering) {
        return;
      }
      undoRedoStore
        .dispatch('undo')
        .then(() => this.$emit('load-xml'))
        .then(() => window.ProcessMaker.EventBus.$emit('modeler-change'));
    },
    redo() {
      if (this.isRendering) {
        return;
      }
      undoRedoStore
        .dispatch('redo')
        .then(() => this.$emit('load-xml'))
        .then(() => window.ProcessMaker.EventBus.$emit('modeler-change'));
    },
  },
};
</script>
