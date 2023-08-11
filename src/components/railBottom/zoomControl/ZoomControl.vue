<template>
  <div class="zoom-box">
    <button
      type="button"
      class="zoom-button"
      data-cy="zoom-out-control"
      @click="onClickZoomOut"
      v-b-tooltip.hover
      :title="$t('Zoom Out')"
    >
      <inline-svg :src="minusIcon" />
    </button>

    <button
      v-if="paperManager"
      @click="onClickReset"
      class="zoom-button zoom-reset"
      data-cy="zoom-reset-control"
      v-b-tooltip.hover
      :title="$t('Reset to initial scale')"
    >{{ percentageText }}</button>

    <button
      type="button"
      class="zoom-button"
      data-cy="zoom-in-control"
      @click="onClickZoomIn"
      v-b-tooltip.hover
      :title="$t('Zoom In')"
    >
      <inline-svg :src="plusIcon" />
    </button>
  </div>
</template>

<script>
import InlineSvg from 'vue-inline-svg';
import minusIcon from '@/assets/railBottom/minus.svg?url';
import plusIcon from '@/assets/railBottom/plus.svg?url';

export default ({
  components: {
    InlineSvg,
  },
  props: {
    paperManager: Object,
  },
  data() {
    return {
      initialScale: 1,
      minimumScale: 0.2,
      scaleStep: 0.1,
      minusIcon,
      plusIcon,
    };
  },
  computed: {
    percentageText() {
      return `${Math.round(this.$props.paperManager.scale.sx * 100)}%`;
    },
  },
  methods: {
    onClickZoomOut() {
      this.paperManager.scale = Math.max(
        this.minimumScale,
        this.paperManager.scale.sx -= this.scaleStep,
      );
    },
    onClickZoomIn() {
      this.paperManager.scale = this.paperManager.scale.sx + this.scaleStep;
    },
    onClickReset() {
      this.paperManager.scale = this.initialScale;
    },
  },
});

</script>

<style lang="scss" scoped src="./zoomControl.scss"></style>
