<template>
  <popper
    trigger="clickToToggle"
    :options="{
      placement: 'top',
      modifiers: { offset: { offset: '0,20px' } }
    }"
    :visible-arrow=false
  >
    <div v-if="data.items">
      <ul class="control-submenu">
        <li v-for="(item, key) in data.items" class="control-submenu-list"  :key="key">
          <img :src=item.iconSrc :alt=item.label>
          <div>
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
    &:hover {
      background: #EBEEF2;
    }

    & > img {
      width: 24px;
      height: 24px;
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
