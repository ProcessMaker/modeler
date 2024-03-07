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
import inspectorIconSvg from '@/assets/inspector.svg';

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
      inspectorIcon: inspectorIconSvg,
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
