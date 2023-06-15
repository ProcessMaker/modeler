<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import nodeTypesStore from '@/nodeTypesStore';
import FilterNodeTypes from '@/components/rails/explorer-rail/filterNodeTypes/filterNodeTypes.vue';
import NodeTypesLoop from '@/components/rails/explorer-rail/nodeTypesLoop/nodeTypesLoop.vue';
import PmBlocksLoop from '@/components/rails/explorer-rail/pmBlocksLoop/pmBlocksLoop.vue';

export default {
  name: 'ExplorerRail',
  props: {
    explorerExpanded: {
      type: Boolean,
    },
    nodeTypes: {
      type: Array,
    },
    pmBlockNodes: {
      type: Array,
    },
  },
  components: {
    FontAwesomeIcon,
    FilterNodeTypes,
    NodeTypesLoop,
    PmBlocksLoop,
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
    /**
     * @param {string} idx
     * @return void
     */
    setTabIndex(idx) {
      if (this.tabIndex === idx) return;
      this.tabIndex = idx;
      this.clearFilteredObjects();
    },
    closeRail() {
      nodeTypesStore.commit('closeExplorer');
      this.clearFilteredObjects();
    },
    clearFilteredObjects() {
      nodeTypesStore.commit('clearFilteredNodes');
      nodeTypesStore.commit('clearFilteredPmBlockNodes');
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
      <filter-node-types :type="'object'"/>
      <node-types-loop
        v-on="$listeners"
      />
    </div>
    <div class="pm-blocks__container"  v-if="tabIndex === 1">
      <filter-node-types :type="'pmBlock'"/>
      <pm-blocks-loop
        v-on="$listeners"
      />
    </div>
  </div>
</template>

<style lang="scss" src="./explorer-rail.scss"></style>
