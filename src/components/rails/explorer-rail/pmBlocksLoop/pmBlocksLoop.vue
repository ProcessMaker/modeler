<script>
import nodeTypesStore from '@/nodeTypesStore';

export default {
  name: 'PmBlocksLoop',
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
      // Deselect control on click if same control is already selected
      if (this.selectedItem === control.type) {
        document.removeEventListener('mousemove', this.setDraggingPosition);
        document.body.removeChild(this.movedElement);
        this.$emit('onSetCursor', 'none');
        this.selectedItem = null;
        this.movedElement = null;
        this.wasClicked = false;
        return;
      }
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
  computed: {
    pmBlockNodeTypes() {
      return nodeTypesStore.getters.getPmBlockNodeTypes;
    },
    filteredPmBlockNodes() {
      return nodeTypesStore.getters.getFilteredPmBlockNodeTypes;
    },
    searchTerm() {
      return nodeTypesStore.getters.getSearchTerm;
    },
  },
};
</script>

<template>
  <div id="pmBlockNodeTypesList">
    <!-- <div id="filteredPmBlockNodes-container" v-if="filteredPmBlockNodes.length > 0">
      <template v-for="object in filteredPmBlockNodes">
        <div
          class="node-types__item"
          :key="object.id"
          @mouseover="showPin = true"
          @mouseleave="showPin = false"
          @click.stop="onClickHandler($event, object)"
        >
          <img class="node-types__item__icon" :src="object.icon" :alt="$t(object.label)">
          <span>{{ $t(object.label) }}</span>
        </div>
      </template>
    </div> -->
    <template>
      <!-- <template v-if="filteredPmBlockNodes.length === 0 && !searchTerm"> -->
      <div class="pmBlocksContainer">
        <template v-for="nodeType in pmBlockNodeTypes">
          <div
            class="pm-block-node-types__item"
            :key="nodeType.id"
            @click.stop="onClickHandler($event, nodeType)"
          >
            <img class="pm-block-node-types__item__icon" :src="nodeType.icon" :alt="$t(nodeType.label)">
            <span>{{ $t(nodeType.label) }}</span>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
#pmBlockNodeTypesList {
  .pinnedObjects {
    margin-bottom: 1rem;
  }
}
.node-types {
  &__item {
    display: flex;
    padding: 0.5rem 0.3rem;
    align-items: center;
    border-radius: 4px;
    user-select: none;
    &:hover {
      background-color: #EBEEF2;
      .pinIcon {
        background-color: #DADDDF;
      }
    }
    &__icon {
      width: 1.5rem;
      height: 1.5rem;
    }
    span {
      margin-left: 0.8rem;
      font-size: 13px;
      line-height: 19px;
    }
    .pinIcon {
      margin-left: auto;
      border-radius: 4px;
      padding: 0.3rem;
    }
  }
}
</style>
