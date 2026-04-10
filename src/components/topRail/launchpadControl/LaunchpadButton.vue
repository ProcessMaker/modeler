<template>
  <button
    type="button"
    class="btn btn-white"
    :class="buttonDisabledClass"
    :title="$t('Open Launchpad')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    data-cy="launchpad-button"
    @mouseleave="handleMouseLeave"
    @mouseover="handleMouseOver" 
    @click.prevent="handleOpenLaunchpad"
    :disabled="disabled"
  >
    <i :class="iconOpen" />
  </button>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      iconOpen: 'fas fa-play',
    };
  },
  computed: {
    buttonDisabledClass() {
      return this.disabled ? 'no-hover' : '';
    },
  },
  methods: {
    handleOpenLaunchpad() {
      this.$emit('verifyLaunchpad', window.ProcessMaker.modeler.launchpad === null);
    },
    handleMouseOver() { 
      if (!this.disabled) {
        this.iconOpen = 'fas fa-external-link-alt'; 
      }
    }, 
    handleMouseLeave() {
      if (!this.disabled) {
        this.iconOpen = 'fas fa-play';
      }
    },
  },
};
</script>

<style scoped> 
  .no-hover:hover {
    background-color: transparent;
  }
</style>
