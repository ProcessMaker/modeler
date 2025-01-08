<template>
  <button
    type="button"
    class="btn btn-white"
    :title="$t('Open Launchpad')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    data-cy="launchpad-button"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
    @click.prevent="handleOpenLaunchpad"
  >
    <i :class="iconOpen" />
  </button>
</template>

<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const iconOpen = ref('fas fa-play');
    const handleOpenLaunchpad = () => {
      console.log('Open Launchpad');
    };

    const handleMouseOver = () => {
      iconOpen.value = 'fas fa-external-link-alt';
    };

    const handleMouseLeave = () => {
      iconOpen.value = 'fas fa-play';
    };

    return {
      iconOpen,
      handleOpenLaunchpad,
      handleMouseOver,
      handleMouseLeave,
    };
  },
});
</script>

