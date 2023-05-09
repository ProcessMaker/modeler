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

    <!-- <button slot="reference"> -->
    <!-- Reference Element -->
    <div slot="reference">
      <div class="control-item-options">
        <span />
        
      </div>
      <img :src=data.iconSrc :alt=data.label>
  
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
  data() {
    return {
    };
  },
});

</script>
  
<style lang="scss" scoped>
.control-submenu {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px;
  // gap: 10px;

  // position: absolute;
  width: 255px;
  // height: 204px;
  left: 616px;
  background: #FFFFFF;
  /* Shadow(SM) */
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.1);
  // border-radius: 4px;
  list-style: none;

  &-list {
    /* Auto layout */

    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 12px 2px;
    gap: 8px;

    width: 235px;
    height: 40px;

    background: #FFFFFF;

    /* Inside auto layout */

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
  
}
</style>
  