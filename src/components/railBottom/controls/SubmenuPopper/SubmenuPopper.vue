<template>
  <popper
    v-if="data.items"
    trigger="clickToOpen"
    :options="{
      placement: 'top',
      modifiers: { offset: { offset: '0,20px' } }
    }"
    :visible-arrow=false
    :force-show="popperType === data.type"
  >
    <div>
      <ul class="control-submenu">
        <li v-for="(item, key) in data.items"
          :class="['control-submenu-list', {'active': selectedItem === item.type}]"
          :key="key"
          @click="onClickHandler($event, item)"
          :data-test="item.type"
        >
          <inline-svg :src="item.icon" :alt=item.label />
          <div class="control-submenu-list-label">
            {{ item.label }}
          </div>
        </li>
      </ul>
    </div>
    <a
      class="control-submenu-item "
      slot="reference"
      :alt=data.label
      :title="$t(data.label)"
      v-b-tooltip.hover
    >
      <div class="control-submenu-options">
        <span />
      </div>

      <inline-svg :src="data.icon" />
    </a>
  </popper>
  <a v-else class="control-submenu-item"
    :alt=data.label
    :title="$t(data.label)"
    v-b-tooltip.hover
  >
    <inline-svg :src=data.icon />
  </a>
</template>

<script>
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';
import InlineSvg from 'vue-inline-svg';

export default ({
  props: {
    data: { type: Object },
    selectedItem: { type: String },
    popperType: { type: String },
  },
  components: {
    Popper,
    InlineSvg,
  },
  data() {
    return {
      wasClickedSubmenu: false,
      element: null,
      wasClicked: false,
    };
  },
  methods: {
    onClickHandler(event, control) {
      event.stopPropagation();
      this.$emit('clickToSubmenu', { event, control });
    },
  },
});

</script>

<style lang="scss" scoped>
.control-submenu {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px;
  width: max-content;
  left: 616px;
  background: #FFFFFF;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  list-style: none;
  &-item {
    & > svg {
      width: 24px;
      height: 24px;
    }
    &.active {
      background-color: #EBEEF2;
    }
  }
  &-list {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 12px 5px;
    gap: 8px;
    height: 40px;
    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
    border-radius: 4px;

    &.active {
      background-color: #DEEBFF;

      & svg {
        fill: #1264AA;
      }
    }
    &:hover {
      background-color: #EBEEF2;
    }

    & > svg {
      width: 24px;
      height: 24px;
    }
    &-label{
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      letter-spacing: -0.02em;
      color: #000000;
    }
  }
  &-options {
    position: absolute;
    top: 0;
    right: 0;
    padding: 3px;
    transform: rotate(47.59deg);
    cursor: pointer;

    & > span {
      display: block;
      width: 4px;
      height: 3px;
      background-color: #44494e;
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      clip-path: padding-box;
    }

    & ~ svg {
      width: 24px;
      height: 24px;
    }
  }
}

.is-dragging {
  background: $primary-color;
  color: $primary-white;
  position: absolute;
  z-index: 10;
  box-shadow: 5px 5px 8px 0 #0000004a;
  padding: 0.5rem;
  pointer-events: none;
  width: 40px;
  height: 40px;
  background: green;
  &.no-drop {
    opacity: 0.8;
    cursor: no-drop;
    pointer-events: none;
  }

  &:hover {
    background-color: $primary-color;
    color: $primary-white;
    pointer-events: none;
  }
}

</style>
