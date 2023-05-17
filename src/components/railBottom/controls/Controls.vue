<template>
  <ul
    v-if="controls"
    class="control-list"
  >
    <li 
      v-for="(item, key) in controls"
      :class="{ 'control-item active': selectedItem === item.type, 'control-item': selectedItem !== item.type }"
      :id="item.id" 
      :key="key"
      @click="onClickHandler($event, item)"
    >
      <SubmenuPopper 
        :data="item" 
        @clickToSubmenu="clickToSubmenuHandler" 
        :selectedItem = "selectedSubmenuItem"
      />
    </li>

    <li class="control-item">
      <div class="control-add" :title="$t('Add')" v-b-tooltip.hover>
        <img :src="plusIcon" :alt="$t('Add')">
      </div>
    </li>
  </ul>
</template>

<script>
import { BOTTOM } from '@/components/controls/rankConstants';
import SubmenuPopper from './SubmenuPopper/SubmenuPopper.vue';
export default ({
  components: {
    SubmenuPopper,
  },
  props: {
    nodeTypes: Array,
  },
  data() {
    return {
      plusIcon: require('@/assets/railBottom/plus-lg-light.svg'),
      wasClicked: false,
      element: null,
      selectedItem: '',
      selectedSubmenuItem: '',
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
          items: nodeType.items || null,
        }))
        .sort((node1, node2) => node1.rank - node2.rank);
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
      const sourceElement = event.target;
      const duplicateElement = sourceElement.cloneNode(true);
      duplicateElement.classList.add('is-dragging');
      duplicateElement.classList.toggle('no-drop', !this.allowDrop);

      document.body.appendChild(duplicateElement);
      this.xOffset = event.clientX - sourceElement.getBoundingClientRect().left;
      this.yOffset = event.clientY - sourceElement.getBoundingClientRect().top;
      // this.draggingElement = duplicateElement;
      // this.draggingControl = control;






      this.wasClicked = true;
      this.element = control;
      this.$emit('onSetCursor', 'crosshair');
      this.selectedItem=control.type;
      window.ProcessMaker.EventBus.$on('custom-pointerclick', message => {
        window.ProcessMaker.EventBus.$off('custom-pointerclick');
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
  },
});
</script>
<style lang="scss" scoped src="./controls.scss"></style>
