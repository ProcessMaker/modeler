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
      @mousedown.stop="onClickControlHandler($event, item, 'down')"
      @mouseup.stop="onClickControlHandler($event, item, 'up')"
      :data-test="`${item.type}-main`"
    >
      <SubmenuPopper
        :data="item"
        @mouseDownSubmenu="($event, data) => clickToSubmenuHandler($event, data, 'down')"
        @mouseUpSubmenu="($event, data) => clickToSubmenuHandler($event, data, 'up')"
        :selectedItem="selectedSubmenuItem"
        :popperType="popperType"
      />
    </li>

    <li class="control-item">
      <div
        :class="{'control-add': true, 'control-active': explorerOpen}"
        :title="$t('Add')"
        v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
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
import plusIcon from '@/assets/railBottom/plus.svg';

export default {
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
      plusIcon,
      currentType: null,
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
    clickToSubmenuHandler(event, data, type){
      if (type === 'up') {
        this.cancelDragNewObject();
        return;
      }

      window.ProcessMaker.EventBus.$off('custom-pointerclick');
      this.wasClicked = false;
      this.parent = this.selectedItem;
      this.selectedSubmenuItem = data.control.type;
      this.startDragNewObject(event, data);
    },
    /**
     * On click on the botton rail control
     * @param {Object} event
     * @param {Object} control
     */
    onClickControlHandler(event, control, type) {
      if (type === 'up') {
        this.cancelDragNewObject();
        return;
      }

      this.selectedSubmenuItem = null;
      this.popperType = this.currentType === control.type ? null : control.type;
      this.startDragNewObject(event, control);
      this.currentType = this.popperType;
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
};
</script>
<style lang="scss" scoped src="./controls.scss"></style>
