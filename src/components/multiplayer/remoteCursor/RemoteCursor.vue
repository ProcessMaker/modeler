<template>
  <div class="remote-cursor" :style="{ left: data.cursor.left + 'px', top: data.cursor.top + 'px' }">
    <svg width="23" height="19" viewBox="0 0 23 19" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5 17.5L2 1L20.5 7L13 9L11.5 17.5Z" :stroke="stroke" :fill="data.color"/>
    </svg>
    <div class="remote-username">
      {{ data.name }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      cursorIcon: require('@/components/multiplayer/remoteCursor/cursor.svg'),
    };
  },
  computed: {
    stroke:  () => {
      return '#212529';
    },
  },

};
</script>

<style scoped lang="scss">
.remote {
  &-cursor {
    position: absolute;
    display: flex;
    width: auto;
    height: 34px;
    z-index: 2;
  }

  &-username {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 17px 0 0 17px;
    padding: 4px 10px;
    gap: 10px;
    border-radius: 4px;
    background-color: #212529;
    color: #FFFFFF;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    min-width: 100px;
  }
}
</style>
