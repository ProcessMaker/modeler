<template>
  <ul
    v-if="controls"
    class="control-list"
  >
    <li
      v-for="item in controls"
      :class="['control-item', {'active': selectedItem === item.type}]"
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

export default ({
  components: {
    SubmenuPopper,
    InlineSvg,
  },
  props: {
    nodeTypes: Array,
  },
  data() {
    return {
      plusIcon: require('@/assets/railBottom/plus.svg'),
      wasClicked: false,
      element: null,
      selectedItem: null,
      selectedSubmenuItem: null,
      xOffset: 0,
      yOffset: 0,
      movedElement: null,
      isDragging: false,
      helperStyles: {
        backgroundColor:'#ffffff',
        position: 'absolute',
        height: '40px',
        width: '40px',
        zIndex: '10',
        opacity: '0.5',
        pointerEvents: 'none',
      },
      popperType: null,
    };
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
      this.parent = this.element;
      this.selectedSubmenuItem = data.control.type;
      this.onClickHandler(data.event, data.control);
    },
    onClickHandler(event, control) {
      this.createDraggingHelper(event, control);
      document.addEventListener('mousemove', this.setDraggingPosition);
      this.setDraggingPosition(event);
      this.wasClicked = true;
      this.element = control;
      this.$emit('onSetCursor', 'crosshair');
      if (!this.parent) {
        this.selectedItem = control.type;
        this.popperType = control.type;
      }
      window.ProcessMaker.EventBus.$on('custom-pointerclick', message => {
        window.ProcessMaker.EventBus.$off('custom-pointerclick');
        document.removeEventListener('mousemove', this.setDraggingPosition);
        if (this.movedElement) {
          document.body.removeChild(this.movedElement);
        }
        this.popperType = null;
        this.selectedSubmenuItem = null;
        this.selectedItem = null;
        this.movedElement = null;
        this.onCreateElement(message);
      });
    },
    onCreateElement(event){
      if (this.wasClicked && this.element) {
        if (this.parent) {
          this.parent = null;
        }
        this.$emit('onCreateElement', { event, control: this.element });
        this.$emit('onSetCursor', 'none');
        event.preventDefault();
        this.wasClicked = false;
      }
    },
    setDraggingPosition({ pageX, pageY }) {
      this.movedElement.style.left = `${pageX}px`;
      this.movedElement.style.top = `${pageY}px`;
    },
    toggleExplorer() {
      nodeTypesStore.commit('toggleExplorer');
      nodeTypesStore.commit('clearFilteredNodes');
    },
    createDraggingHelper(event, control) {
      if (this.movedElement) {
        document.removeEventListener('mousemove', this.setDraggingPosition);
        document.body.removeChild(this.movedElement);
        this.movedElement = null;
      }
      const sourceElement = event.target;
      this.movedElement = document.createElement('img');
      Object.keys(this.helperStyles).forEach((property) => {
        this.movedElement.style[property] = this.helperStyles[property];
      });
      this.movedElement.src = control.icon;
      document.body.appendChild(this.movedElement);
      this.xOffset = event.clientX - sourceElement.getBoundingClientRect().left;
      this.yOffset = event.clientY - sourceElement.getBoundingClientRect().top;
    },
  },
  async mounted() {
    if (window.Cypress) {
      const objects = nodeTypesStore.getters.getNodeTypes;
      nodeTypesStore.dispatch('addUserPinnedObject', objects[0]);
      nodeTypesStore.dispatch('addUserPinnedObject', objects[3]);
      nodeTypesStore.dispatch('addUserPinnedObject', objects[4]);
    }
  },
});
</script>
<style lang="scss" scoped src="./controls.scss"></style>
