<template>
  <div class="toolbar d-flex justify-content-between align-items-center border-top border-bottom " role="toolbar" aria-label="Toolbar" :class="{ 'ignore-pointer': canvasDragPosition }">
    <nav>
      <ol class="breadcrumb">
        <li v-if="allBreadcrumbs.length <= 0" class="breadcrumb-item">
          <a href="/"><i class="fas fa-home"/></a>
        </li>
        <li class="breadcrumb-item" v-for="(breadcrumb,index) in allBreadcrumbs.flat()" :key="index">
          <a :href="breadcrumb.url"> {{ breadcrumb.text }}</a>
        </li>
      </ol>
    </nav>
    <div class="mr-3">
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

      <div class="btn-group btn-group-sm mr-2" role="group" aria-label="Zoom controls">
        <b-button
          class="btn btn-sm btn-secondary"
          @click="scale += scaleStep"
          data-test="zoom-in"
          v-b-tooltip.hover
          :title="$t('Zoom In')"
        >
          <font-awesome-icon :icon="plusIcon" />
        </b-button>
        <b-button
          class="btn btn-sm btn-secondary"
          @click="scale = Math.max(minimumScale, scale -= scaleStep)"
          data-test="zoom-out"
          v-b-tooltip.hover
          :title="$t('Zoom Out')"
        >
          <font-awesome-icon :icon="minusIcon" />
        </b-button>
        <b-button
          class="btn btn-sm btn-secondary"
          @click="scale = initialScale"
          :disabled="scale === initialScale"
          data-test="zoom-reset"
          v-b-tooltip.hover
          :title="$t('Reset to initial scale')"
        >
          {{ $t('Reset') }}
        </b-button>
        <span class="btn btn-sm btn-secondary scale-value">{{ Math.round(scale*100) }}%</span>
      </div>

      <div class="btn-group btn-group-sm mr-2" role="group" aria-label="Additional controls">
        <b-button
          class="btn btn-sm btn-secondary ml-auto"
          data-test="panels-btn"
          @click="panelsCompressed = !panelsCompressed"
          v-b-tooltip.hover
          :title="panelsCompressed ? $t('Show Menus') : $t('Hide Menus')"
        >
          <font-awesome-icon :icon="panelsCompressed ? expandIcon : compressIcon" />
        </b-button>

        <b-button
          class="btn btn-sm btn-secondary mini-map-btn ml-auto"
          data-test="mini-map-btn"
          @click="miniMapOpen = !miniMapOpen"
          v-b-tooltip.hover
          :title="miniMapOpen ? $t('Hide Mini-Map') : $t('Show Mini-Map')"
        >
          <font-awesome-icon :icon="miniMapOpen ? minusIcon : mapIcon" />
        </b-button>
      </div>

      <b-button
        v-if="allBreadcrumbs.length <= 0"
        class="btn btn-sm btn-secondary mini-map-btn ml-auto"
        data-test="mini-map-btn"
        @click="saveBpmn"
        v-b-tooltip.hover
        title="Save"
      >
        <font-awesome-icon :icon="saveIcon" />
      </b-button>   
    </div> 
  </div>
</template>
<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCompress, faExpand, faMapMarked, faMinus, faPlus, faRedo, faUndo, faSave } from '@fortawesome/free-solid-svg-icons';
import undoRedoStore from '@/undoRedoStore';

export default {
  name: 'tool-bar',
  components: { FontAwesomeIcon },
  props: {
    canvasDragPosition: {},
    cursor: {},
    paperManager: {},
    isRendering: {
      type: Boolean,
    },
    allBreadcrumbs: {
      type: Array,
    },

  },
  watch: {
    scale(scale) {
      this.paperManager.scale = scale;
      if (scale === this.initialScale) {
        this.$root.$emit('bv::hide::tooltip');
      }
    },
    miniMapOpen(isOpen) {
      this.$emit('toggle-mini-map-open', isOpen);
    },
    panelsCompressed(isCompressed) {
      this.$emit('toggle-panels-compressed', isCompressed);
    },
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
  data() {
    return {
      plusIcon: faPlus,
      minusIcon: faMinus,
      scale: 1,
      initialScale: 1,
      minimumScale: 0.2,
      scaleStep: 0.1,
      mapIcon: faMapMarked,
      miniMapOpen: false,
      compressIcon: faCompress,
      expandIcon: faExpand,
      panelsCompressed: false,
      undoIcon: faUndo,
      redoIcon: faRedo,
      saveIcon: faSave,
      foo: [
        {
          'text':'home',
          'url':'www.google.ca',
        },
        {
          'text':'home',
          'url':'www.google.ca',
        },
      ],
    };
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
    saveBpmn() {
      this.$emit('saveBpmn');
    },
  },
};
</script>
<style lang="scss" src="./toolbar.scss" scoped />
