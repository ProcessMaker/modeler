<template>
  <crown-button
    :title="$t('Copy Element')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    id="copy-button"
    aria-label="Copy Element"
    :src="connectIcon"
    role="menuitem"
    @click="$emit('copy-element', node)"
  />
</template>

<script>
import connectIcon from '@/assets/connect-artifacts.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';

export default {
  components: { CrownButton },
  props: ['node'],
  data() {
    return {
      connectIcon,
    };
  },
};
</script>
