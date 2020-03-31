<template>
  <crown-button
    v-if="!invalidSequenceFlowSources.includes(node.type)"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    :title="$t('Sequence Flow')"
    id="sequence-flow-button"
    aria-label="Create a sequence flow"
    :src="sequenceFlow"
    role="menuitem"
    @click="addSequence"
  />
</template>
<script>
import sequenceFlow from '@/assets/connect-elements.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';
import Node from '@/components/nodes/node';

export default {
  components: { CrownButton },
  props: ['node', 'sequenceFlowConfig', 'moddle'],
  data() {
    return {
      sequenceFlow,
      invalidSequenceFlowSources: [
        'processmaker-modeler-sequence-flow',
        'processmaker-modeler-message-flow',
        'processmaker-modeler-end-event',
        'processmaker-modeler-error-end-event',
        'processmaker-modeler-message-end-event',
        'processmaker-modeler-lane',
        'processmaker-modeler-text-annotation',
        'processmaker-modeler-pool',
        'processmaker-modeler-association',
      ],
    };
  },
  methods: {
    addSequence(cellView, evt, x, y) {
      this.$emit('toggle-crown-state', false);
      const sequenceLink = this.sequenceFlowConfig.definition(this.moddle, this.$t);
      sequenceLink.set('sourceRef', this.node.definition);
      sequenceLink.set('targetRef', { x, y });

      if (
        sequenceLink.sourceRef.$type === 'bpmn:ExclusiveGateway' ||
        sequenceLink.sourceRef.$type === 'bpmn:InclusiveGateway') {
        sequenceLink.conditionExpression = this.moddle.create('bpmn:FormalExpression', {
          body: '',
        });
      }

      this.$emit('add-node', new Node(
        'processmaker-modeler-sequence-flow',
        sequenceLink,
        this.sequenceFlowConfig.diagram(this.moddle),
      ));
    },
  },
  created() {
    this.$t = this.$t.bind(this);
  },
};
</script>
