<template>
  <button
    type="button"
    class="btn btn-white"
    :title="$t('Open Launchpad')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    data-cy="launchpad-button"
    @mouseleave="handleMouseLeave"
    @mouseover="handleMouseOver" 
    @click.prevent="handleOpenLaunchpad"
  >
    <i :class="iconOpen" />
  </button>
</template>

<script>
export default {
  data() {
    return {
      iconOpen: 'fas fa-play',
    };
  },
  methods: {
    handleOpenLaunchpad() {
      this.$emit('verifyLaunchpad', window.ProcessMaker.modeler.launchpad === null);
    },
    handleMouseOver() { 
      this.iconOpen = 'fas fa-external-link-alt'; 
    }, 
    handleMouseLeave() {
      this.iconOpen = 'fas fa-play';
    },
  },
};
</script>
