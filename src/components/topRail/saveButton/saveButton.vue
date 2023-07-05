<template>
  <button
    type="button"
    @click.prevent="onClick"
    class="save-button"
    :title="$t('Save')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    data-cy="save-button"
  >
    <font-awesome-icon :icon="saveIcon" />
  </button>
</template>

<script>
import { faSave } from '@fortawesome/free-solid-svg-icons';
export default { 
  data() {
    return {
      isOpen: false,
      saveIcon: faSave,
    };
  },
  methods: {
    /**
     * Show/hide issue button
     */
    onClick() {
      // eslint-disable-next-line no-console
      console.log('onClick');
      this.isOpen = !this.isOpen;
      this.$emit('saveBpmn');
      // this.$emit('openIssue', this.isOpen);
    },
  },
};
</script>

<style scoped lang="scss" src="./saveButton.scss"></style>
