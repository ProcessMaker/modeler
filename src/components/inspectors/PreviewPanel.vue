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
      <svg class="lds-gear" width="150px" height="100%"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <g transform="translate(50 50)">
          <g transform="rotate(248.825)">
            <animateTransform attributeName="transform" type="rotate" values="0;360" keyTimes="0;1" dur="4.7s" repeatCount="indefinite"></animateTransform>
            <path d="M37.43995192304605 -6.5 L47.43995192304605 -6.5 L47.43995192304605 6.5 L37.43995192304605 6.5 A38 38 0 0 1 35.67394948182593 13.090810836924174 L35.67394948182593 13.090810836924174 L44.33420351967032 18.090810836924174 L37.83420351967032 29.34914108612188 L29.17394948182593 24.34914108612188 A38 38 0 0 1 24.34914108612188 29.17394948182593 L24.34914108612188 29.17394948182593 L29.34914108612188 37.83420351967032 L18.090810836924184 44.33420351967032 L13.090810836924183 35.67394948182593 A38 38 0 0 1 6.5 37.43995192304605 L6.5 37.43995192304605 L6.500000000000001 47.43995192304605 L-6.499999999999995 47.43995192304606 L-6.499999999999996 37.43995192304606 A38 38 0 0 1 -13.09081083692417 35.67394948182593 L-13.09081083692417 35.67394948182593 L-18.09081083692417 44.33420351967032 L-29.34914108612187 37.834203519670325 L-24.349141086121872 29.173949481825936 A38 38 0 0 1 -29.17394948182592 24.34914108612189 L-29.17394948182592 24.34914108612189 L-37.83420351967031 29.349141086121893 L-44.33420351967031 18.0908108369242 L-35.67394948182592 13.090810836924193 A38 38 0 0 1 -37.43995192304605 6.5000000000000036 L-37.43995192304605 6.5000000000000036 L-47.43995192304605 6.500000000000004 L-47.43995192304606 -6.499999999999993 L-37.43995192304606 -6.499999999999994 A38 38 0 0 1 -35.67394948182593 -13.090810836924167 L-35.67394948182593 -13.090810836924167 L-44.33420351967032 -18.090810836924163 L-37.834203519670325 -29.34914108612187 L-29.173949481825936 -24.34914108612187 A38 38 0 0 1 -24.349141086121893 -29.17394948182592 L-24.349141086121893 -29.17394948182592 L-29.349141086121897 -37.834203519670304 L-18.0908108369242 -44.334203519670304 L-13.090810836924195 -35.67394948182592 A38 38 0 0 1 -6.500000000000005 -37.43995192304605 L-6.500000000000005 -37.43995192304605 L-6.500000000000007 -47.43995192304605 L6.49999999999999 -47.43995192304606 L6.499999999999992 -37.43995192304606 A38 38 0 0 1 13.090810836924149 -35.67394948182594 L13.090810836924149 -35.67394948182594 L18.090810836924142 -44.33420351967033 L29.349141086121847 -37.83420351967034 L24.349141086121854 -29.17394948182595 A38 38 0 0 1 29.17394948182592 -24.349141086121893 L29.17394948182592 -24.349141086121893 L37.834203519670304 -29.349141086121897 L44.334203519670304 -18.0908108369242 L35.67394948182592 -13.090810836924197 A38 38 0 0 1 37.43995192304605 -6.500000000000007 M0 -20A20 20 0 1 0 0 20 A20 20 0 1 0 0 -20"></path>
          </g>
        </g>
      </svg>
    </div>

    <no-preview-available v-show="previewUrl === null"/>
    <iframe v-show="previewUrl !== null && !showSpinner" :src="previewUrl" style="width:100%; height:100%;border:0px none;" @load="loading"/>
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
      console.log('loading...');
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
      console.log('highlighted y data:', this.highlightedNode, this.data);
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

      var clone = {};
      for (let prop in this.data) {
        if ((previewConfig?.receivingParams ?? []).includes(prop)) {
          clone[prop] = this.data[prop];
        }
      }
      const nodeData = JSON.stringify(clone);

      this.previewUrl = previewConfig ? `${previewConfig.url}?node=${nodeData}` : null;
      this.taskTitle = this?.highlightedNode?.definition?.name;
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
