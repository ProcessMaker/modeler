<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import nodeTypesStore from '@/nodeTypesStore';
import pinIcon from '@/assets/pin-angle.svg';
import pinFillIcon from '@/assets/pin-angle-fill.svg';

export default {
  name: 'ExplorerRail',
  props: {
    explorerExpanded: Boolean,
    nodeTypes: {
      type: Array,
    },
  },
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      pinIcon,
      pinFillIcon,
      expanded: this.explorerExpanded,
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
    unpinnedObjects() {
      return this.objects.filter((obj) => !this.pinnedObjects.includes(obj));
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
    toggleRail() {
      this.expanded = !this.expanded;
    },
    closeRail() {
      this.expanded = false;
    },
    pinObject(object) {
      nodeTypesStore.commit('setPinnedNodes', object);
    },
    unpinObject(object) {
      nodeTypesStore.commit('setUnpinNode', object);
    },
  },
};
</script>

<template>
  <!--  todo add v-if for expanded-->
  <div id="explorer-rail" data-test="explorer-rail">
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
      <p>{{ $t('Pinned Objects') }}</p>
      <template v-for="pinnedObject in pinnedObjects">
        <div class="node-types__item" :key="pinnedObject.id">
          <img :src="pinnedObject.icon" :alt="$t(pinnedObject.label)">
          <span>{{ $t(pinnedObject.label) }}</span>
          <button class="pinIcon" @click="unpinObject(pinnedObject)">
            <img
              :src="pinFillIcon"
              alt="Unpin Element"
            >
          </button>
        </div>
      </template>
      <p>{{ $t('Object Category') }}</p>
      <template v-for="object in unpinnedObjects">
        <div class="node-types__item" :key="object.id">
          <img :src="object.icon" :alt="$t(object.label)">
          <span>{{ $t(object.label) }}</span>
          <button class="pinIcon" @click="pinObject(object)">
            <img
              :src="pinIcon"
              alt="Pin Element"
            >
          </button>
        </div>
      </template>
    </div>
    <div class="pm-blocks__container">
      <!--   Here goes the PM Blocks   -->
    </div>
  </div>
</template>

<style lang="scss" src="./explorer-rail.scss"></style>
