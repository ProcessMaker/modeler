<template>
  <b-col
    id="preview_panel"
    class="pl-0 h-100 overflow-hidden preview-column"
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
                <span>Document</span>
              </div>
            </b-dropdown-item>

            <b-dropdown-item key="2" class="ellipsis-dropdown-item mx-auto" @click="onSelectedPreview(2)">
              <div class="ellipsis-dropdown-content">
                <b class="pr-1 fa-fw">{ }</b>
                <span>Object</span>
              </div>
            </b-dropdown-item>
          </b-dropdown>
          <span>Preview - {{ screenTitle }}</span>
        </div>
      </b-col>
      <b-col class="actions">
        <div>
          <i class="fas fa-external-link-alt"/>
          <i class="fas fa-times" @click="hide()" />
        </div>
      </b-col>
    </b-row>

    <b-row>
      <div style="background-color: #0074D9; height: 20px; width: 100%">&nbsp;</div>
    </b-row>

    <b-row>
      <div class="item-title"> {{ screenTitle }} </div>
      <div class="task-title"> {{ taskTitle }} </div>
    </b-row>

    <iframe src="https://www.vestibular.ita.br/" class="paneiframe"/>
  </b-col>

</template>

<script>
import Vue from 'vue';
import store from '@/store';
import VueResizable from 'vue-resizable';


export default {
  props: ['nodeRegistry'],
  components: {VueResizable},
  data() {
    return {
      data: {},
      selectedPreview: '1',
      showPanel: true,
      taskTitle: '',
      screenTitle: '',
      myWidth: '400',
    };
  },
  watch: {
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
    onResize() {
      console.log('resizee...');
      this.myWidth = '800';

    },
    prepareData() {
      if (!this.highlightedNode) {
        return {};
      }

      const type = this.highlightedNode && this.highlightedNode.type;

      const defaultDataTransform = (node) => Object.entries(node.definition).reduce((data, [key, value]) => {
        data[key] = value;

        return data;
      }, {});

      this.data = type && this.nodeRegistry[type].inspectorData
        ? this.nodeRegistry[type].inspectorData(this.highlightedNode, defaultDataTransform, this)
        : defaultDataTransform(this.highlightedNode);

      this.taskTitle = this.data?.name;
      this.screenTitle = this.data?.screenName;
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
    show(node) {
      console.log('show', node);
      this.taskTitle = node?.name;
      this.showPanel = true;
    },
    hide() {
      this.showPanel = false;
    },
  },
};
</script>
<style lang="scss" src="./preview_panel.scss" scoped />
