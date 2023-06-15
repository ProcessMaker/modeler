<template>
  <button
    type="button"
    @click="toggleInspector"
    class="inspector-button"
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
  data() {
    return {
      showInspector: false,
      inspectorIcon: require('@/assets/inspector.svg'),
    };
  },
  methods: {
    toggleInspector() {
      this.showInspector = !this.showInspector;

      this.$emit('toggleInspector', this.showInspector);
    },
  },
};
</script>

<style scoped lang="scss" src="./inspectorButton.scss"></style>
