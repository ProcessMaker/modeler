<template>
  <div class="ur-box">
    <button type="button"
      class="ur-button"
      data-test="undo"
      v-b-tooltip.hover
      :title="$t('Undo')"
    >
      <img :src="undoIcon" :alt="$t('Undo')" >
    </button>

    <div class="ur-divider" />

    <button type="button"
      class="ur-button"
      data-test="redo"
      v-b-tooltip.hover
      :title="$t('Redo')"
    >
      <img :src="redoIcon" :alt="$t('Redo')" >
    </button>
  </div>
</template>

<script>

export default ({
  data() {
    return {
      undoIcon: require('@/assets/railBottom/undo.svg'),
      redoIcon: require('@/assets/railBottom/redo.svg'),
    };
  },
});
</script>

<style lang="scss" scoped src="./undoRedoControl.scss"></style>
