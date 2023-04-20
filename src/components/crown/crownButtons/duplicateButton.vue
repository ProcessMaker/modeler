<template>
  <crown-button
    v-if="node.isBpmnType(...validCopyElements)"
    :title="$t('Duplicate Element')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    aria-label="Duplicate Element"
    data-test="duplicate-button"
    role="menuitem"
    @click="duplicateElement"
  >
    <img
      :src="duplicateIcon"
      aria-hidden="true"
    >
  </crown-button>
  
</template>

<script>
import CrownButton from '@/components/crown/crownButtons/crownButton';
import duplicateIcon from '@/assets/copy-regular.svg';
import validCopyElements from '@/components/crown/crownButtons/validCopyElements';

export default {
  components: { CrownButton },
  props: ['node'],
  data() {
    return {
      copyCount: 0,
      duplicateIcon,
      validCopyElements,
    };
  },
  methods: {
    duplicateElement() {
      this.$emit('duplicate-element', this.node, ++this.copyCount);
    },
  },
};
</script>
