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
        >
          <component
            :is="component.button"
            v-for="(component, index) in validationBar"
            :key="`validation-status-${index}`"
          />
        </TopRail>

        <div
          class="d-flex align-items-center btn-group btn-group-sm"
          role="group"
          aria-label="Publish controls"
          data-cy="publish-control"
        >
          <div class="divider" />
          <template v-if="isVersionsInstalled">
            <div
              class="toolbar-item toolbar-version-status"
              data-cy="publish-version-status"
            >
              {{ versionStatus }}
            </div>
            <div
              class="toolbar-item toolbar-loading-status"
              data-cy="publish-loading-status"
            >
              <span>
                {{ loadingStatus }}
              </span>
              <font-awesome-icon class="text-success" :icon="loadingIcon" :spin="isLoading" />
            </div>
            <a
              :title="$t('Publish')"
              @click="$emit('saveBpmn')"
              class="toolbar-item toolbar-publish"
              data-cy="publish-btn"
            >
              {{ $t('Publish') }}
            </a>
            <a
              :title="$t('Close')"
              @click="$emit('close')"
              class="toolbar-item toolbar-close"
              data-cy="close-btn"
            >
              {{ $t('Close') }}
            </a>
            <EllipsisMenu
              :actions="ellipsisMenuActions"
              :divider="false"
              @navigate="onNavigate"
              @show="onShow"
              @hide="onHide"
              data-cy="ellipsis-menu"
            />
          </template>
          <template
            v-else
          >
            <button
              class="save-button"
              data-test="mini-map-btn"
              v-b-tooltip.hover
              :title="$t('Save')"
              @click="$emit('saveBpmn')"
            >
              <font-awesome-icon :icon="saveIcon" />
              <span class="save-button-label">{{ $t('Save') }}</span>
            </button>

            <b-btn
              class="ml-1 rounded"
              :disabled="!xmlManager"
              variant="secondary"
              size="sm"
              data-test="downloadXMLBtn"
              @click="xmlManager && xmlManager.download()"
            >
              <i class="fas fa-download mr-1"/>
              {{ $t('Download BPMN') }}
            </b-btn>

            <b-btn
              variant="secondary"
              size="sm"
              v-b-modal="'uploadmodal'"
              class="ml-1 rounded"
            >
              <i class="fas fa-upload mr-1"/>
              {{ $t('Upload XML') }}
            </b-btn>
          </template>
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
    'validationBar',
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
          value: 'save-template',
          content: this.$t('Save as Template'),
          icon: '',
        },
        {
          value: 'save-pm-block',
          content: this.$t('Save as PM Block'),
          icon: '',
        },
        {
          value: 'discard-draft',
          content: this.$t('Discard Draft'),
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
        case 'save-pm-block':
          this.$emit('publishPmBlock');
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
    const childProcess = this.$root.$children[0]?.process;
    if (childProcess?.is_template) {
      const indexOfActions = this.ellipsisMenuActions.findIndex(object => {
        return object.value === 'save-template';
      });

      this.ellipsisMenuActions.splice(indexOfActions, 1);
    }
  },
};
</script>
<style lang="scss" src="./toolbar.scss" />
