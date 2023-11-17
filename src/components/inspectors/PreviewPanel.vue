<template>
  <b-row ref="resizableDiv"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
    v-show="visible"
  >
    <b-col class="col-auto p-0 resizer-column" @mousedown="onMouseDown" />
    <b-col
      class="pl-0 h-100 overflow-hidden preview-column"
      :style="{ width: panelWidth + 'px' }"
      data-test="preview-panel"
    >
      <b-row class="control-bar">
        <b-col cols="9">
          <div>
            <i v-show = "selectedPreview === 1" class="fas fa-file-alt"/>
            <b v-show = "selectedPreview === 2"> {} </b>
            <b-dropdown
              variant="ellipsis"
              no-caret
              no-flip
              lazy
              class="preview-type-dropdown"
              v-model="selectedPreview"
            >
              <template #button-content>
                <i class="fas fa-sort-down" />
              </template>

              <b-dropdown-item key="1" class="ellipsis-dropdown-item mx-auto" @click="onSelectedPreview(1)">
                <div class="ellipsis-dropdown-content">
                  <b class="pr-1 fa-fw fas fa-file-alt" />
                  <span>{{ $t('Document') }}</span>
                </div>
              </b-dropdown-item>

            </b-dropdown>
            <span>{{ $t('Preview') }} - {{ taskTitle }}</span>
          </div>
        </b-col>
        <b-col class="actions">
          <i class="fas fa-external-link-alt" v-show="previewUrl" @click="openAsset()"/>
          <i class="fas fa-times" @click="onClose()" />
        </b-col>
      </b-row>

      <b-row class="divider"/>

      <b-row>
        <div class="task-title"> {{ taskTitle }} </div>
      </b-row>

      <loading-preview v-show="showSpinner"/>

      <no-preview-available v-show="!previewUrl"/>

      <iframe
        title="Preview"
        v-show="!!previewUrl && !showSpinner"
        :src="previewUrl"
        class="preview-iframe"
        @load="loading"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
      />

    </b-col>
  </b-row>
</template>

<script>
import store from '@/store';
import NoPreviewAvailable from '@/components/inspectors/NoPreviewAvailable';
import LoadingPreview from '@/components/inspectors/LoadingPreview.vue';

export default {
  props: ['nodeRegistry', 'visible', 'previewConfigs', 'panelWidth'],
  components: { NoPreviewAvailable, LoadingPreview },
  data() {
    return {
      data: {},
      previewUrl: null,
      showSpinner: false,
      selectedPreview: '1',
      taskTitle: '',
      itemTitle: '',
      width: 600,
      currentPos: 600,
    };
  },
  watch: {
    previewUrl(value, oldValue) {
      if (value !== oldValue) {
        this.showSpinner = true;
      }
    },
    highlightedNode() {
      document.activeElement.blur();
      this.prepareData();
    },
    'highlightedNode.definition'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.assignmentLock'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.allowReassignment'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.assignedUsers'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.assignedGroups'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.assignmentRules'(current, previous) { this.handleAssignmentChanges(current, previous); },
  },
  computed: {
    highlightedNode() {
      return store.getters.highlightedNodes[0];
    },
  },
  methods: {
    loading() {
      this.showSpinner = false;
    },
    getConfig(data) {
      return this.previewConfigs.find(config => {
        return config.matcher(data);
      });
    },
    openAsset() {
      const nodeConfig = this.getConfig(this.data);
      window.open(nodeConfig.assetUrl(this.data), '_blank');
    },
    prepareData() {
      if (!this.highlightedNode) {
        return {};
      }

      const defaultDataTransform = (node) => Object.entries(node.definition).reduce((data, [key, value]) => {
        data[key] = value;
        return data;
      }, {});

      this.data = defaultDataTransform(this.highlightedNode);
      this.taskTitle = this.data?.name;

      this.taskTitle = this?.highlightedNode?.definition?.name;
      this.previewNode();
    },

    handleAssignmentChanges(currentValue, previousValue) {
      if (currentValue === previousValue) {
        return;
      }

      const nodeConfig = this.getConfig(this.data);

      if (nodeConfig) {
        this.prepareData();
      } else {
        this.$emit('togglePreview', false);
      }
    },
    onSelectedPreview(item) {
      this.selectedPreview = item;
    },
    previewNode(force = false) {
      if (!this.highlightedNode || (!this.visible && !force)) {
        return;
      }

      const previewConfig = this.previewConfigs.find(config => {
        return config.matcher(this.data);
      });

      let clone = {};
      for (let prop in this.data) {
        if ((previewConfig?.receivingParams ?? []).includes(prop)) {
          clone[prop] = this.data[prop];
        }
      }

      const nodeData = encodeURI(JSON.stringify(clone));

      // if the node has the configurations (for example screenRef for a task in a task)
      const nodeHasConfigParams = Object.keys(clone).length > 0;
      this.previewUrl = previewConfig &&  nodeHasConfigParams ? `${previewConfig.url}?node=${nodeData}` : null;
      this.taskTitle = this.highlightedNode?.definition?.name;
    },
    onClose() {
      this.$emit('togglePreview', false);
    },
    onMouseDown(event) {
      this.$emit('startResize', event);
    },
    onMouseUp() {
      this.$emit('stopResize');
    },
    onMouseMove(event) {
      if (window.ProcessMaker.$modeler.isResizingPreview) {
        this.$emit('previewResize', event);
      }
    },
    setWidth(positionX) {
      const dx = this.currentPos - positionX;
      this.currentPos = positionX;
      this.width = parseInt(this.width) + dx;
    },
  },
};
</script>
<style lang="scss" src="./preview_panel.scss" scoped />
