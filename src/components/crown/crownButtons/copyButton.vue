<template>
  <crown-button
    v-if="node.isBpmnType(...validCopyElements)"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    :title="$t('Copy Element')"
    aria-label="Copy Element"
    data-test="copy-button"
    role="menuitem"
    :src="copyIcon"
    @click="copyElement"
  />
</template>

<script>
import CrownButton from "@/components/crown/crownButtons/crownButton";
import copyIcon from "@/assets/copy-regular.svg";
import validCopyElements from "@/components/crown/crownButtons/validCopyElements";

export default {
  components: { CrownButton },
  props: ["node"],
  data() {
    return {
      copyCount: 0,
      copyIcon,
      validCopyElements
    };
  },
  methods: {
    copyElement() {
      this.$emit("copy-element", this.node, ++this.copyCount);
    }
  }
};
</script>
