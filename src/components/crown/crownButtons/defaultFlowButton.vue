<template>
  <crown-button
    v-if="node.canBeDefaultFlow()"
    :title="$t('Set as Default Flow')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    aria-label="Default Flow"
    data-test="default-flow"
    role="menuitem"
    @click="click"
  >
    <img
      :src="icon"
      aria-hidden="true"
    >
  </crown-button>
</template>

<script>
import CrownButton from '@/components/crown/crownButtons/crownButton';
import icon from '@/assets/default-flow.svg';

export default {
  components: { CrownButton },
  props: ['node'],
  data() {
    return {
      icon,
    };
  },
  methods: {
    click() {
      this.$emit('default-flow', this.node);
    },
  },
};
</script>
