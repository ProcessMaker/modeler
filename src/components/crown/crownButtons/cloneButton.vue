<template>
  <crown-button
    v-if="node.isBpmnType(...validCopyElements)"
    :title="$t('Clone Element')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    aria-label="Clone Element"
    data-test="clone-button"
    role="menuitem"
    @click="cloneElement"
  >
    <img
      :src="cloneIcon"
      aria-hidden="true"
      alt="Clone element icon"
    >
  </crown-button>
  
</template>

<script>
import CrownButton from '@/components/crown/crownButtons/crownButton';
import cloneIcon from '@/assets/copy-regular.svg';
import validCopyElements from '@/components/crown/crownButtons/validCopyElements';

export default {
  components: { CrownButton },
  props: ['node'],
  data() {
    return {
      copyCount: 0,
      cloneIcon,
      validCopyElements,
    };
  },
  methods: {
    cloneElement() {
      this.$emit('clone-element', this.node, ++this.copyCount);
    },
  },
};
</script>
