<template>
  <div class="remote-cursor" :style="{ left: left + 'px', top: top + 'px' }">
    <inline-svg :src="cursorIcon" :fill="cursorColor" />

    <div class="remote-username">
      {{ username }}
    </div>
  </div>
</template>

<script>
import InlineSvg from 'vue-inline-svg';

export default {
  components: {
    InlineSvg,
  },
  props: {
    cursorColor: {
      type: String,
      default: '#000000',
    },
    username: {
      type: String,
    },
    top: {
      type: Number,
    },
    left: {
      type: Number,
    },
  },
  data() {
    return {
      cursorIcon: require('@/components/multiplayer/remoteCursor/cursor.svg'),
    };
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
    // left: 20px;
    // top: 80px;
  }

  &-username {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 12px;
    padding: 4px 10px;
    gap: 10px;
    border-radius: 4px;
    background-color: #212529;

    color: #FFFFFF;
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
}
</style>
