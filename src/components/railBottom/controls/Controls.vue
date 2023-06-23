<template>
  <ul
    v-if="controls"
    class="control-list"
  >
    <li
      v-for="item in controls"
      :class="['control-item', {'active': selectedItem && (selectedItem.type === item.type)}]"
      :id="item.id"
      :key="item.id"
      @click.stop="onClickHandler($event, item)"
      :data-test="`${item.type}-main`"
    >
      <SubmenuPopper
        :data="item"
        @clickToSubmenu="clickToSubmenuHandler"
        :selectedItem="selectedSubmenuItem"
        :popperType="popperType"
      />
    </li>

    <li class="control-item">
      <div
        :class="{'control-add': true, 'control-active': explorerOpen}"
        :title="$t('Add')"
        v-b-tooltip.hover
        @click="toggleExplorer"
      >
        <inline-svg :src="plusIcon" />
      </div>
    </li>
  </ul>
</template>

<script>
import InlineSvg from 'vue-inline-svg';
import nodeTypesStore from '@/nodeTypesStore';
import SubmenuPopper from './SubmenuPopper/SubmenuPopper.vue';
import clickAndDrop from '@/mixins/clickAndDrop';

export default ({
  components: {
    SubmenuPopper,
    InlineSvg,
  },
  props: {
    nodeTypes: Array,
  },
  mixins: [clickAndDrop],
  data() {
    return {
      plusIcon: require('@/assets/railBottom/plus.svg'),
    };
  },
  created() {
    nodeTypesStore.dispatch('getUserPinnedObjects');
  },
  computed: {
    controls() {
      return nodeTypesStore.getters.getPinnedNodeTypes;
    },
    explorerOpen() {
      return nodeTypesStore.getters.getExplorerOpen;
    },
  },
  methods: {
    clickToSubmenuHandler(data){
      window.ProcessMaker.EventBus.$off('custom-pointerclick');
      this.wasClicked = false;
      this.parent = this.selectedItem;
      this.selectedSubmenuItem = data.control.type;
      this.onClickHandler(data.event, data.control);
    },
    toggleExplorer() {
      // Remove control click & drop selection when the Add button is clicked
      this.deselect();
      this.popperType = null;
      this.selectedSubmenuItem = null;

      // Toggle left explorer
      nodeTypesStore.commit('toggleExplorer');
      nodeTypesStore.commit('clearFilteredNodes');
      nodeTypesStore.commit('clearFilteredPmBlockNodes');
    },
  },
});
</script>
<style lang="scss" scoped src="./controls.scss"></style>
