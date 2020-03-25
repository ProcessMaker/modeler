<template>
  <crown-button
    v-if="isValidMessageFlowSource"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    :title="$t('Message Flow')"
    id="message-flow-button"
    aria-label="Create a message flow"
    :src="messageFlow"
    role="menuitem"
    @click="addMessageFlow"
  />
</template>
<script>
import messageFlow from '@/assets/message-flow.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';
import Node from '@/components/nodes/node';

const validMessageFlowSourceTypes = [
  'processmaker-modeler-message-end-event',
  'processmaker-modeler-pool',
  'processmaker-modeler-task',
  'processmaker-modeler-call-activity',
];

export default {
  components: { CrownButton },
  props: ['node', 'moddle', 'shape'],
  data() {
    return {
      messageFlow,
    };
  },
  computed: {
    isValidMessageFlowSource() {
      return this.node.isBpmnType('bpmn:IntermediateThrowEvent') ||
        validMessageFlowSourceTypes.some(type => this.node.isType(type));
    },
  },
  methods: {
    addMessageFlow(cellView, evt, x, y) {
      this.$emit('toggle-crown-state', false);

      const messageFlowDefinition = this.moddle.create('bpmn:MessageFlow', {
        name: '',
        sourceRef: this.shape.component.node.definition,
        targetRef: { x, y },
      });

      this.$emit('add-node', new Node(
        'processmaker-modeler-message-flow',
        messageFlowDefinition,
        this.moddle.create('bpmndi:BPMNEdge'),
      ));
    },
  },
};
</script>
