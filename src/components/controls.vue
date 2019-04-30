<template>
  <b-card no-body>
    <b-input-group size="sm" class="p-2">
      <b-input-group-prepend>
        <span class="input-group-text"><i class="fas fa-filter"/></span>
      </b-input-group-prepend>

      <b-form-input ref="filter"
        :placeholder="`${$t('Filter')}...`"
        class="sticky-top"
        type="text"
        v-model="filterQuery"
      />
    </b-input-group>

    <b-list-group v-for="(items, category) in controls" :key="category" class="overflow-auto">
      <b-card-header class="border bg-light sticky-top p-2">{{ $t(category) }}</b-card-header>
      <b-list-group-item v-for="(control, index) in items"
        v-if="control.label.toLowerCase().includes(filterQuery.toLowerCase())"
        :key="index"
        class=""
        :data-test="control.type"
        @dragstart="$event.preventDefault()"
        @mousedown="startDrag($event, control.type)"
      >
        <div class="tool d-flex align-items-center">
          <div class="img-container text-break">
            <img :src="control.icon">
          </div>
          {{ $t(control.label) }}
        </div>
      </b-list-group-item>
    </b-list-group>
  </b-card>
  <!-- <div class="controls">
    <input
      ref="filter"
      :placeholder="`${$t('Filter')}...`"
      class="form-control form-control-sm"
      type="text"
      v-model="filterQuery"
    >

    <div class="list">
      <div v-for="(items, category) in controls" :key="category">
        <h2>{{ $t(category) }}</h2>
        <div
          v-for="(control, index) in items"
          v-if="control.label.toLowerCase().includes(filterQuery.toLowerCase())"
          :key="index"
          :data-test="control.type"
          @dragstart="$event.preventDefault()"
          @mousedown="startDrag($event, control.type)"
        >
          <div class="tool">
            <div class="img-container">
              <img :src="control.icon">
            </div>
            {{ $t(control.label) }}
          </div>
        </div>
      </div>
    </div>
  </div> -->
</template>

<script>
export default {
  props: ['controls', 'allowDrop'],
  watch: {
    allowDrop(allowDrop) {
      if (this.draggingElement) {
        this.draggingElement.classList.toggle('no-drop', !allowDrop);
      }
    },
  },
  data() {
    return {
      filterQuery: '',
      draggingElement: null,
      draggingControlType: null,
      xOffset: null,
      yOffset: null,
    };
  },
  methods: {
    startDrag(event, controlType) {
      const sourceElement = event.target;
      const duplicateElement = sourceElement.cloneNode(true);
      duplicateElement.classList.add('is-dragging');
      duplicateElement.classList.toggle('no-drop', !this.allowDrop);
      duplicateElement.style.width = `${sourceElement.clientWidth}px`;
      duplicateElement.style.height = `${sourceElement.clientHeight}px`;

      this.$root.$el.appendChild(duplicateElement);
      this.xOffset = event.clientX - sourceElement.getBoundingClientRect().left;
      this.yOffset = event.clientY - sourceElement.getBoundingClientRect().top;
      this.draggingElement = duplicateElement;
      this.draggingControlType = controlType;

      document.addEventListener('mousemove', this.setDraggingPosition);
      document.addEventListener('mouseup', this.dropElement);
      document.addEventListener('keyup', this.stopDrag);

      this.setDraggingPosition(event);
    },
    stopDrag(event) {
      if (event && event.key !== 'Escape') {
        return;
      }

      document.removeEventListener('mousemove', this.setDraggingPosition);
      document.removeEventListener('mouseup', this.dropElement);
      document.removeEventListener('keyup', this.stopDrag);

      this.$root.$el.removeChild(this.draggingElement);
      this.draggingElement = null;
      this.draggingControlType = null;
    },
    dropElement({ clientX, clientY }) {
      this.$emit('handleDrop', { clientX, clientY, type: this.draggingControlType });
      this.stopDrag();
    },
    setDraggingPosition({ pageX, pageY, clientX, clientY }) {
      this.draggingElement.style.left = pageX - this.xOffset + 'px';
      this.draggingElement.style.top = pageY - this.yOffset + 'px';
      this.$emit('drag', { clientX, clientY, type: this.draggingControlType });
    },
  },
};
</script>

<style lang="scss">
.card-header {
  background: #f7f7f7;
}

.tool {
  font-size: 0.75em;
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
  text-align: left;
  padding: 1.25rem;

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
  pointer-events: none;
  margin-right: 8px;
  width: 32px;
  text-align: center;
}


// .tool {
//   display: flex;
//   align-items: center;
//   font-size: 0.75em;
//   padding: 4px;
//   font-weight: bold;
//   color: #333;
//   cursor: grab;
//   user-select: none;

//   &.is-dragging {
//     background: #3397e1;
//     color: white;
//     position: absolute;
//     z-index: 10;
//     box-shadow: 5px 5px 8px 0px #0000004a;
//     cursor: grabbing;
//     text-align: left;

//     &.no-drop {
//       opacity: 0.8;
//       cursor: no-drop;
//     }
//   }

//   &:hover {
//     background-color: #3397e1;
//     color: white;
//   }

//   .img-container {
//     pointer-events: none;
//     margin-right: 8px;
//     width: 32px;
//     text-align: center;
//   }
// }

// .controls {
//   background-color: #eee;
//   border-right: 1px solid #aaa;
//   width: 320px;
//   text-align: left;
//   display: flex;
//   flex-direction: column;

//   .list {
//     overflow: auto;
//     height: 100%;
//     position: relative;

//     h2 {
//       background-color: #aaa;
//       border-top: 1px solid #999;
//       border-bottom: 1px solid #999;
//       padding-left: 8px;
//       margin-bottom: 0px;
//       font-size: 0.75em;
//       font-weight: bold;
//       padding-bottom: 8px;
//       padding-top: 8px;
//     }
//   }
// }
</style>
