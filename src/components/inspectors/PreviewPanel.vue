<template>
  <b-col
    v-show="visible"
    id="preview_panel"
    class="pl-0 h-100 overflow-hidden preview-column"
    :style="{ maxWidth: width + 'px' }"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mousemove="onMouseMove"
    data-test="preview-column"
  >
    <b-row class="control-bar">
      <b-col cols="9">
        <div>
          <i v-show = "selectedPreview == 1" class="fas fa-file-alt"/>
          <b v-show = "selectedPreview == 2"> {} </b>
          <b-dropdown
            variant="ellipsis"
            no-caret
            no-flip
            lazy
            class="dropdown-right"
            style="margin-top:-10px"
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

            <b-dropdown-item key="2" class="ellipsis-dropdown-item mx-auto" @click="onSelectedPreview(2)">
              <div class="ellipsis-dropdown-content">
                <b class="pr-1 fa-fw">{ }</b>
                <span>{{ $t('Object') }}</span>
              </div>
            </b-dropdown-item>
          </b-dropdown>
          <span>{{ $t('Preview') }} - {{ taskTitle }}</span>
        </div>
      </b-col>
      <b-col class="actions">
        <div>
          <i class="fas fa-external-link-alt"/>
          <i class="fas fa-times" @click="onClose()" />
        </div>
      </b-col>
    </b-row>

    <b-row>
      <div style="background-color: #0074D9; height: 20px; width: 100%">&nbsp;</div>
    </b-row>

    <b-row>
      <div class="task-title"> {{ taskTitle }} </div>
    </b-row>

    <div id="spinner" class="row justify-content-center" v-if="showSpinner">
      <img :src="spinner">
    </div>

    <no-preview-available v-show="!previewUrl"/>
    <iframe title="Preview" v-show="!!previewUrl && !showSpinner" :src="previewUrl" style="width:100%; height:100%;border: none;" @load="loading"/>
  </b-col>

</template>

<script>
import store from '@/store';
import NoPreviewAvailable from '@/components/inspectors/NoPreviewAvailable';

export default {
  props: ['nodeRegistry', 'visible', 'previewConfigs'],
  components: { NoPreviewAvailable },
  data() {
    return {
      data: {},
      previewUrl: null,
      showSpinner: false,
      spinner: require('@/assets/spiner.svg'),
      selectedPreview: '1',
      taskTitle: '',
      itemTitle: '',
      width: 600,
      isDragging: false,
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
      this.prepareData();
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

      this.previewUrl = previewConfig ? `${previewConfig.url}?node=${nodeData}` : null;
      this.taskTitle = this.highlightedNode?.definition?.name;
      this.showPanel = true;
    },
    onClose() {
      this.$emit('togglePreview', false);
    },
    onMouseDown(event) {
      this.isDragging = true;
      this.currentPos = event.x;
    },
    onMouseUp() {
      this.isDragging = false;
    },
    onMouseMove(event) {
      if (this.isDragging) {
        const dx = this.currentPos - event.x;
        this.currentPos = event.x;
        this.width = parseInt(this.width) + dx;
        this.$emit('previewResize', this.width);
      }
    },
  },
};
</script>
<style lang="scss" src="./preview_panel.scss" scoped />
