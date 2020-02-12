<template>
  <crown-button
    v-if="validCopyElements.includes(node.type)"
    :title="$t('Copy Element')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    aria-label="Copy Element"
    data-test="copy-button"
    role="menuitem"
    :src="copyIcon"
    @click="copyElement"
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
      copyCount: 0,
      copyIcon,
      validCopyElements: [
        'processmaker-modeler-start-event',
        'processmaker-modeler-message-start-event',
        'processmaker-modeler-task',
        'processmaker-modeler-end-event',
        'processmaker-modeler-error-end-event',
        'processmaker-modeler-message-end-event',
        'processmaker-modeler-script-task',
        'processmaker-modeler-manual-task',
        'processmaker-modeler-exclusive-gateway',
        'processmaker-modeler-parallel-gateway',
        'processmaker-modeler-inclusive-gateway',
        'processmaker-modeler-event-based-gateway',
        'processmaker-modeler-text-annotation',
        'processmaker-modeler-start-timer-event',
        'processmaker-modeler-intermediate-catch-timer-event',
        'processmaker-modeler-intermediate-message-catch-event',
        'processmaker-modeler-intermediate-message-throw-event',
        'processmaker-modeler-call-activity',
        'processmaker-custom-marker-task-test',
      ],
    };
  },
  methods: {
    copyElement() {
      this.copyCount++;
      this.$emit('copy-element', this.node, this.copyCount);
    },
  },
};
</script>
