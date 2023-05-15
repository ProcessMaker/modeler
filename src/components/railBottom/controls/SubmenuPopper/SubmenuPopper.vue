<template>
  <popper
    v-if="data.items"
    trigger="clickToToggle"
    :options="{
      placement: 'top',
      modifiers: { offset: { offset: '0,20px' } }
    }"
    :visible-arrow=false
  >
    <div v-if="data.items">
      <ul class="control-submenu">
        <li v-for="(item, key) in data.items"
          :class="{ 'control-submenu-list active': item.active, 'control-submenu-list': !item.active }"
          :key="key"
          @click="onClickHandler($event, item)"
        >
          <img :src=item.iconSrc :alt=item.label>
          <div class="control-submenu-list-label">
            {{ item.label }}
          </div>
        </li>
      </ul>
    </div>
    <div slot="reference">
      <div class="control-submenu-options">
        <span />
      </div>
      <img
        :src=data.iconSrc
        :alt=data.label
        :title="$t(data.label)"
        v-b-tooltip.hover
      >
    </div>
    
  </popper>
  <div v-else>
    <div class="control-submenu-options">
      <!-- <span /> -->
    </div>
    <img
      :src=data.iconSrc
      :alt=data.label
      :title="$t(data.label)"
      v-b-tooltip.hover
    >
  </div>
</template>

<script>
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';
export default ({
  props: {
    data: { type: Object },
  },
  components: {
    Popper,
  },
  data() {
    return {
      wasClickedSubmenu: false,
      element: null,
    };
  },
  methods: {
    onClickHandler(event, control) {
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
  width: 255px;
  left: 616px;
  background: #FFFFFF;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  list-style: none;
  &-list {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 12px 2px;
    gap: 8px;
    width: 235px;
    height: 40px;
    flex: none;
    order: 0;
    align-self: stretch;
    flex-grow: 0;
    &.active {
      background: #EBEEF2;
    }
    &:hover {
      background: #EBEEF2;
    }

    & > img {
      width: 24px;
      height: 24px;
    }
    &-label{
      font-family: 'Open Sans';
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

  }
}

</style>
