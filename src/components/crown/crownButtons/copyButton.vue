<template>
  <crown-button
    :title="$t('Copy Element')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    id="copy-button"
    aria-label="Copy Element"
    role="menuitem"
    :src="copyIcon"
    @click="$emit('copy-element', node)"
  />
</template>

<script>
import CrownButton from '@/components/crown/crownButtons/crownButton';
import copyIcon from '@/assets/copy-regular.svg';

export default {
  components: { CrownButton },
  props: ['node'],
  data() {
    return {
      copyIcon,
    };
  },
};
</script>
