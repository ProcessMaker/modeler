<template>
  <b-row class="w-100 m-0">
    <div class="toolbar d-flex justify-content-between align-items-center border-top border-bottom" role="toolbar"
      aria-label="Toolbar" :class="{ 'ignore-pointer': canvasDragPosition }"
    >
      <breadcrumb :breadcrumb-data="breadcrumbData" />
      <div class="d-flex mr-3">
        <TopRail
          :validation-errors="validationErrors"
          :warnings="warnings"
        />

        <!-- TODO Remove this line when redesigning -->
        <!-- <align-buttons @save-state="$emit('save-state')" /> -->

        <!-- TODO Remove this block when redesigning -->
        <!-- <div class="btn-group btn-group-sm mr-2" role="group" aria-label="Additional controls">
          <b-button
            class="btn btn-sm btn-secondary ml-auto"
            data-test="panels-btn"
            @click="$emit('toggle-panels-compressed')"
            v-b-tooltip.hover
            :title="panelsCompressed ? $t('Show Menus') : $t('Hide Menus')"
          >
            <font-awesome-icon :icon="panelsCompressed ? expandIcon : compressIcon" />
          </b-button>
        </div> -->

        <div class="d-flex align-items-center btn-group btn-group-sm" role="group" aria-label="Publish controls">
          <template v-if="isVersionsInstalled">
            <div class="toolbar-item toolbar-version-status">
              {{ versionStatus }}
            </div>
            <div class="toolbar-item toolbar-loading-status">
              <span>
                {{ loadingStatus }}
              </span>
              <font-awesome-icon class="text-success" :icon="loadingIcon" :spin="isLoading" />
            </div>
            <a
              class="toolbar-item toolbar-publish"
              data-test="publish-btn"
              :title="$t('Publish')"
              @click="$emit('saveBpmn')"
            >
              {{ $t('Publish') }}
            </a>
            <a
              class="toolbar-item toolbar-autosave"
              data-test="close-btn"
              :title="$t('Close')"
              @click="$emit('close')"
            >
              {{ $t('Close') }}
            </a>
            <EllipsisMenu
              :actions="ellipsisMenuActions"
              :divider="false"
              @navigate="onNavigate"
              @show="onShow"
              @hide="onHide"
            />
          </template>
          <!-- Remove this block when redesigning -->
          <!-- <b-button
            v-else
            class="btn btn-sm btn-secondary mini-map-btn mx-1"
            data-test="mini-map-btn"
            v-b-tooltip.hover
            :title="$t('Save')"
            @click="$emit('saveBpmn')"
          >
            <font-awesome-icon :icon="saveIcon" />
          </b-button> -->
        </div>
      </div>
    </div>
  </b-row>
</template>
<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCompress, faExpand, faMapMarked, faMinus, faPlus, faRedo, faUndo, faSave, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import undoRedoStore from '@/undoRedoStore';
import Breadcrumb from '@/components/toolbar/breadcrumb/Breadcrumb';
import TopRail from '@/components/topRail/TopRail.vue';

export default {
  name: 'tool-bar',
  components: {
    Breadcrumb,
    TopRail,
    FontAwesomeIcon,
  },
  props: [
    'canvasDragPosition',
    'cursor',
    'paperManager',
    'isRendering',
    'breadcrumbData',
    'panelsCompressed',
    'validationErrors',
    'warnings',
    'xmlManager',
  ],
  watch: {
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
    versionStatus() {
      const status = undoRedoStore.getters.isDraft ? 'Draft' : 'Published';
      return this.$t(status);
    },
    isVersionsInstalled() {
      return undoRedoStore.getters.isVersionsInstalled;
    },
    isLoading() {
      return undoRedoStore.getters.isLoading;
    },
    loadingStatus() {
      const status = this.isLoading ? 'Saving' : 'Saved';
      return this.$t(status);
    },
    loadingIcon() {
      return this.isLoading ? this.spinner : this.savedIcon;
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
      spinner: faSpinner,
      ellipsisMenuActions: [
        {
          value: 'discard-draft',
          content: this.$t('Discard Draft'),
          icon: '',
        },
        {
          value: 'save-template',
          content: this.$t('Save as Template'),
          icon: '',
        },
      ],
    };
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
    onNavigate(action) {
      switch (action.value) {
        case 'discard-draft':
          window.ProcessMaker.EventBus.$emit('open-versions-discard-modal');
          break;
        case 'save-template':
          this.$emit('publishTemplate');
          break;
        default:
          break;
      }
    },
    onShow() {
      const inspectorDiv = document.getElementById('inspector');
      if (inspectorDiv) {
        inspectorDiv.style.zIndex = '1';
      }
    },
    onHide() {
      const inspectorDiv = document.getElementById('inspector');
      if (inspectorDiv) {
        inspectorDiv.style.zIndex = '2';
      }
    },
  },
  mounted() {
    if (this.$root.$children[0].process.is_template) {
      const indexOfActions = this.ellipsisMenuActions.findIndex(object => {
        return object.value === 'save-template';
      });

      this.ellipsisMenuActions.splice(indexOfActions, 1);
    }
  },
};
</script>
<style lang="scss" src="./toolbar.scss" />
