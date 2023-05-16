<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import nodeTypesStore from '@/nodeTypesStore';
import FilterNodeTypes from '@/components/rails/explorer-rail/filterNodeTypes/filterNodeTypes.vue';
import NodeTypesLoop from '@/components/rails/explorer-rail/nodeTypesLoop/nodeTypesLoop.vue';

export default {
  name: 'ExplorerRail',
  props: {
    nodeTypes: {
      type: Array,
    },
  },
  components: {
    FontAwesomeIcon,
    FilterNodeTypes,
    NodeTypesLoop,
  },
  data() {
    return {
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
    objects() {
      return nodeTypesStore.getters.getNodeTypes;
    },
    pinnedObjects() {
      return nodeTypesStore.getters.getPinnedNodeTypes;
    },
    filteredNodes() {
      return nodeTypesStore.getters.getFilteredNodeTypes;
    },
    explorerOpen() {
      return nodeTypesStore.getters.getExplorerOpen;
    },
  },
  created() {
    nodeTypesStore.commit('setNodeTypes', this.nodeTypes);
  },
  methods: {
    faTimes() {
      return faTimes;
    },
    setTabIndex(idx) {
      this.tabIndex = idx;
    },
    closeRail() {
      nodeTypesStore.commit('closeExplorer');
    },
  },
};
</script>

<template>
  <div id="explorer-rail" data-test="explorer-rail" v-if="explorerOpen">
    <div class="rail-menu">
      <b-tabs class="tabs--container" :no-nav-style="true">
        <template v-for="tab in tabs">
          <b-tab :title="$t(tab.label)" :active="tab.idx === tabIndex"
            @click="setTabIndex(tab.idx)" :key="tab.idx"
          />
        </template>
      </b-tabs>
      <div class="close--container" @click="closeRail()">
        <font-awesome-icon :icon="faTimes()"/>
      </div>
    </div>
    <div class="node-types__container" v-if="tabIndex === 0">
      <filter-node-types />
      <template v-if="filteredNodes.length > 0">
        <node-types-loop :nodeTypes="filteredNodes" />
      </template>
      <template v-else>
        <node-types-loop  v-if="pinnedObjects.length > 0" 
          label="Pinned Objects"
          :nodeTypes="pinnedObjects"
        />
        <node-types-loop v-if="objects.length > 0"
          label="Object Category"
          :nodeTypes="objects"
        />
      </template>
    </div>
    <div class="pm-blocks__container">
      <!--   Here goes the PM Blocks   -->
    </div>
  </div>
</template>

<style lang="scss" src="./explorer-rail.scss"></style>
