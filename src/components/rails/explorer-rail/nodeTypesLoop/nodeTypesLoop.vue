<script>
export default {
  name: 'NodeTypesLoop',
  props: {
    label: {
      type: String,
    },
    nodeTypes: {
      type: Array,
    },
  },
  data() {
    return {
      wasClicked: false,
      element: null,
      selectedItem: null,
      xOffset: 0,
      yOffset: 0,
      movedElement: null,
      helperStyles: {
        backgroundColor:'#ffffff',
        position: 'absolute',
        height: '40px',
        width: '40px',
        zIndex: '10',
        opacity: '0.5',
        pointerEvents: 'none',
      },
    };
  },
  methods: {
    onClickHandler(event, control) {
      this.createDraggingHelper(event, control);
      document.addEventListener('mousemove', this.setDraggingPosition);
      this.setDraggingPosition(event);
      this.wasClicked = true;
      this.element = control;
      this.$emit('onSetCursor', 'crosshair');
      this.selectedItem = control.type;
      window.ProcessMaker.EventBus.$on('custom-pointerclick', message => {
        window.ProcessMaker.EventBus.$off('custom-pointerclick');
        document.removeEventListener('mousemove', this.setDraggingPosition);
        if (this.movedElement) {
          document.body.removeChild(this.movedElement);
        }
        this.selectedItem = null;
        this.movedElement = null;
        this.onCreateElement(message);
      });
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
    setDraggingPosition({ pageX, pageY }) {
      this.movedElement.style.left = pageX  + 'px';
      this.movedElement.style.top = pageY + 'px';
    },
    onCreateElement(event){
      if (this.wasClicked && this.element) {
        this.$emit('onCreateElement', { event, control: this.element });
        this.$emit('onSetCursor', 'none');
        event.preventDefault();
        this.wasClicked = false;
      }
    },
  },
};
</script>

<template>
  <div>
    <p>{{ $t(label) }}</p>
    <template v-for="nodeType in nodeTypes">
      <div
        class="node-types__item"
        :key="nodeType.id"
        @click.stop="onClickHandler($event, nodeType)"
      >
        <img :src="nodeType.icon" :alt="$t(nodeType.label)">
        <span>{{ $t(nodeType.label) }}</span>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.node-types {
  &__item {
    display: flex;
    margin-bottom: 1rem;
    align-items: center;
    img {
      height: 1.5rem;
      width: 1.5rem;
    }
    span {
      margin-left: 0.8rem;
      font-size: 13px;
      line-height: 19px;
    }
  }
}
</style>
