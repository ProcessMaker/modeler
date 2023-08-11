<template>
  <button
    type="button"
    @click="toggleInspector"
    class="inspector-button"
    data-cy="inspector-button"
  >
    <inline-svg :src="inspectorIcon" />
  </button>
</template>

<script>
import InlineSvg from 'vue-inline-svg';

export default {
  components: {
    InlineSvg,
  },
  props: {
    showInspector: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      inspectorIcon: require('@/assets/inspector.svg'),
    };
  },
  methods: {
    toggleInspector() {
      this.$emit('toggleInspector', !this.showInspector);
    },
  },
};
</script>

<style scoped lang="scss" src="./inspectorButton.scss"></style>
