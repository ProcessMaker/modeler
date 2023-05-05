<script>
import { BOTTOM } from '@/components/controls/rankConstants.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export default {
  name: 'ExplorerRail',
  props: {
    nodeTypes: {
      type: Array,
    },
  },
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      expanded: false,
      tabs: [{
        idx: 0,
        label: 'Add Object',
      }, {
        idx: 1,
        label: 'PM Blocks',
      }],
      tabIndex: 0,
    };
  },
  computed: {
    controls() {
      return this.nodeTypes
        .filter(nodeType => nodeType.control)
        .map(nodeType => ({
          type: nodeType.id,
          icon: nodeType.icon,
          label: nodeType.label,
          bpmnType: nodeType.bpmnType,
          rank: nodeType.rank || BOTTOM,
        }))
        .sort((node1, node2) => node1.rank - node2.rank);
    },
  },
  methods: {
    faTimes() {
      return faTimes;
    },
    setTabIndex(idx) {
      this.tabIndex = idx;
    },
    toggleRail() {
      this.expanded = !this.expanded;
    },
    closeRail() {
      this.expanded = false;
    },
  },
};
</script>

<template>
  <!--  todo add v-if for expanded-->
  <div id="explorer-rail" data-test="explorer-rail">
    <div class="rail-menu">
      <b-tabs class="tabs--container">
        <template v-for="tab in tabs">
          <b-tab class="tab" :title="$t(tab.label)" :active="tab.idx === tabIndex" @click="setTabIndex(tab.idx)" :key="tab.idx"/>
        </template>
      </b-tabs>
      <div class="close--container" @click="closeRail()">
        <font-awesome-icon :icon="faTimes()" />
      </div>
    </div>
    <div class="node-types__container" v-if="tabIndex === 0">
      <template v-for="control in controls">
        <div class="node-types__item" :key="control.id">
          <img :src="control.icon" :alt="$t(control.label)">
          <span>{{ $t(control.label) }}</span>
        </div>
      </template>
    </div>
    <div class="pm-blocks__container">
      <!--   Here goes the PM Blocks   -->
    </div>
  </div>
</template>

<style scoped lang="scss" src="./explorer-rail.scss"></style>
