<template>
  <b-card
    no-body
    class="controls border-top-0 rounded-0 border-bottom-0 border-left-0"
  >
    <b-card-header class="py-2 px-2 font-weight-bold border-bottom-0 rounded-0">
      <div class="d-flex align-items-center justify-content-between">
        Controls
        <b-button
          @click="toggleExpand"
          size="sm"
          class="font-weight-bold"
        >
          <span v-if="expanded">&lt;</span>
          <span v-else>&gt;</span>
        </b-button>
      </div>
    </b-card-header>
    <b-input-group class="rounded-0">
      <b-input-group-prepend>
        <span class="input-group-text rounded-0"><i class="fas fa-filter" /></span>
      </b-input-group-prepend>

      <b-form-input
        ref="filter"
        :placeholder="`${$t('Filter')}...`"
        class="sticky-top rounded-0 border-right-0"
        type="text"
        v-model="filterQuery"
      />
    </b-input-group>

    <b-list-group
      flush
      class="overflow-auto w-auto"
    >
      <b-list-group-item
        v-for="(control, index) in controlItems"
        v-if="control.label.toLowerCase().includes(filterQuery.toLowerCase())"
        :key="index"
        class="control-item p-2 border-right-0 flex-grow-1"
        :data-test="control.type"
        @dragstart="$event.preventDefault()"
        @mousedown="startDrag($event, control.type)"
      >
        <div
          class="tool text-truncate ml-1"
          v-b-tooltip.hover
          :title="control.label"
        >
          <img
            :src="control.icon"
            class="tool-icon mr-1"
          >
          {{ $t(control.label) }}
        </div>
      </b-list-group-item>
    </b-list-group>

  </b-card>
</template>

<script>
import flatten from "lodash/flatten";

export default {
  props: ["controls", "allowDrop"],
  watch: {
    allowDrop(allowDrop) {
      if (this.draggingElement) {
        this.draggingElement.classList.toggle("no-drop", !allowDrop);
      }
    }
  },
  data() {
    return {
      expanded: true,
      filterQuery: '',
      draggingElement: null,
      draggingControlType: null,
      xOffset: null,
      yOffset: null,
    };
  },
  computed: {
    controlItems() {
      return flatten(Object.values(this.controls));
    }
  },
  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    },
    startDrag(event, controlType) {
      const sourceElement = event.target;
      const duplicateElement = sourceElement.cloneNode(true);
      duplicateElement.classList.add("is-dragging");
      duplicateElement.classList.toggle("no-drop", !this.allowDrop);

      document.body.appendChild(duplicateElement);
      this.xOffset = event.clientX - sourceElement.getBoundingClientRect().left;
      this.yOffset = event.clientY - sourceElement.getBoundingClientRect().top;
      this.draggingElement = duplicateElement;
      this.draggingControlType = controlType;

      document.addEventListener("mousemove", this.setDraggingPosition);
      document.addEventListener("mouseup", this.dropElement);
      document.addEventListener("keyup", this.stopDrag);

      this.setDraggingPosition(event);
    },
    stopDrag(event) {
      if (event && event.key !== "Escape") {
        return;
      }

      document.removeEventListener("mousemove", this.setDraggingPosition);
      document.removeEventListener("mouseup", this.dropElement);
      document.removeEventListener("keyup", this.stopDrag);

      document.body.removeChild(this.draggingElement);
      this.draggingElement = null;
      this.draggingControlType = null;
    },
    dropElement({ clientX, clientY }) {
      this.$emit("handleDrop", {
        clientX,
        clientY,
        type: this.draggingControlType
      });
      this.stopDrag();
    },
    setDraggingPosition({ pageX, pageY, clientX, clientY }) {
      this.draggingElement.style.left = pageX - this.xOffset + "px";
      this.draggingElement.style.top = pageY - this.yOffset + "px";
      this.$emit("drag", { clientX, clientY, type: this.draggingControlType });
    }
  }
};
</script>

<style lang="scss">



.card-header {
  background: #f7f7f7;
}

.list-group-item:first-child {
  border-top: 0;
}

.tool {
  cursor: grab;
  user-select: none;
}

.is-dragging {
  background: #3397e1;
  color: white;
  position: absolute;
  z-index: 10;
  box-shadow: 5px 5px 8px 0px #0000004a;
  cursor: grabbing;
  padding: 0.5rem;

  &.no-drop {
    opacity: 0.8;
    cursor: no-drop;
  }

  &:hover {
    background-color: #3397e1;
    color: white;
  }
}

.img-container {
  width: 1rem;
  pointer-events: none;
}

.tool-icon {
  width: 1.5rem;
  pointer-events: none;
}

textarea:hover,
input:hover,
textarea:active,
input:active,
textarea:focus,
input:focus,
button:focus,
button:active,
button:hover,
label:focus,
.btn:active,
.btn.active {
  outline: 0px !important;
  -webkit-appearance: none;
}
</style>
