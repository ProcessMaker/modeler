<template>
  <b-row class="w-100 m-0">
    <div class="toolbar d-flex justify-content-between align-items-center border-top border-bottom" role="toolbar"
      aria-label="Toolbar" :class="{ 'ignore-pointer': canvasDragPosition }"
    >
      <breadcrumb :breadcrumb-data="breadcrumbData" />
      <div class="mr-3">
        <align-buttons @save-state="$emit('save-state')" />

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
            @click="$emit('toggle-panels-compressed')"
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
        <div class="btn-group btn-group-sm" role="group" aria-label="Publish controls">
          <template v-if="isVersionsInstalled">
            <div class="d-flex justify-content-center align-items-center text-black text-capitalize" :style="{ width: '65px' }">
              <span class="toolbar-item mr-1" :style="{ fontWeight: 600 }">
                {{ versionStatus }}
              </span>
            </div>
            <div class="d-flex justify-content-center align-items-center text-black text-capitalize mx-2" :style="{ width: '60px' }">
              <span class="toolbar-item mr-1" :style="{ fontWeight: 400 }">
                {{ $t('Saved') }}
              </span>
              <span>
                <font-awesome-icon class="text-success" :icon="savedIcon" />
              </span>
            </div>
            <button
              class="btn btn-sm btn-primary mini-map-btn text-uppercase mx-2"
              type="button"
              data-test="publish-btn"
              :title="$t('Publish')"
              @click="$emit('saveBpmn')"
            >
              {{ $t('Publish') }}
            </button>
            <button
              class="btn btn-sm btn-link toolbar-item mini-map-btn text-black text-uppercase"
              type="button"
              data-test="close-btn"
              @click="$emit('close')"
            >
              {{ $t('Close') }}
            </button>
          </template>
          <b-button
            v-else
            class="btn btn-sm btn-secondary mini-map-btn mx-1"
            data-test="mini-map-btn"
            v-b-tooltip.hover
            :title="$t('Save')"
            @click="$emit('saveBpmn')"
          >
            <font-awesome-icon :icon="saveIcon" />
          </b-button>
        </div>
      </div>
    </div>
  </b-row>
</template>
<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCompress, faExpand, faMapMarked, faMinus, faPlus, faRedo, faUndo, faSave, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import undoRedoStore from '@/undoRedoStore';
import Breadcrumb from '@/components/toolbar/breadcrumb/Breadcrumb';
import AlignButtons from '@/components/toolbar/alignButtons/AlignButtons';

export default {
  name: 'tool-bar',
  components: { Breadcrumb, FontAwesomeIcon, AlignButtons },
  props: {
    canvasDragPosition: {},
    cursor: {},
    paperManager: {},
    isRendering: {
      type: Boolean,
    },
    breadcrumbData: {
      type: Array,
    },
    panelsCompressed: Boolean,
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
    saved() {
      return undoRedoStore.getters.saved;
    },
    versionStatus() {
      const status = undoRedoStore.getters.isDraft ? 'Draft' : 'Published';
      return this.$t(status);
    },
    isVersionsInstalled() {
      return undoRedoStore.getters.isVersionsInstalled;
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
      undoIcon: faUndo,
      redoIcon: faRedo,
      saveIcon: faSave,
      savedIcon: faCheckCircle,
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
  },
};
</script>
<style lang="scss" src="./toolbar.scss" />
