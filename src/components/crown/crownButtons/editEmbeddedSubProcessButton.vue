<template>
  <crown-button
    :title="$t('Edit sub process')"
    role="menuitem"
    id="edit-embedded-subprocess-button"
    aria-label="Edit sub process"
    data-test="edit-embedded-subprocess-button"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    @click="$emit('edit')"
  >
    <i class="fas fa-sitemap cog-container--button" />
  </crown-button>
</template>

<script>
import CrownButton from '@/components/crown/crownButtons/crownButton';

export default {
  components: { CrownButton },
};
</script>
