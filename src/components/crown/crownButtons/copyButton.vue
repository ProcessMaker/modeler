<template>
  <crown-button
    v-if="node.isBpmnType(...validCopyElements)"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    :title="$t('Copy Element')"
    aria-label="Copy Element"
    data-test="copy-button"
    role="menuitem"
    @click="copyElement"
  >
    <img :src="copyIcon" aria-hidden="true" />
  </crown-button>
</template>

<script>
import CrownButton from "@/components/crown/crownButtons/crownButton.vue";
import copyIcon from "!!svg-inline-loader!@/assets/copy-regular.svg";
import validCopyElements from "@/components/crown/crownButtons/validCopyElements";

export default {
  components: { CrownButton },
  props: ["node"],
  data() {
    return {
      copyCount: 0,
      copyIcon,
      validCopyElements,
    };
  },
  methods: {
    copyElement() {
      this.$emit("copy-element", this.node, ++this.copyCount);
    },
  },
};
</script>
