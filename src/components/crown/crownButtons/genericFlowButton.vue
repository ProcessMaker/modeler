<template>
  <crown-button
    v-if="allowOutgoingSequenceFlow"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    :title="$t('Flow')"
    id="generic-flow-button"
    aria-label="Create a flow"
    :src="sequenceFlow"
    role="menuitem"
    @click="addSequence"
  />
</template>
<script>
import Flow from '@/assets/connect-elements.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';
import Node from '@/components/nodes/node';
import { id as genericFlowId } from '@/components/nodes/genericFlow/config';

// eslint-disable-next-line no-unused-vars
const sequenceFlowBlacklist = [
  'bpmn:MessageFlow',
  'bpmn:SequenceFlow',
  'bpmn:Lane',
  'bpmn:TextAnnotation',
  'bpmn:Association',
  'bpmn:DataObjectReference',
  'bpmn:DataStoreReference',
];

const dontShowOn = [

  'processmaker-modeler-end-event',
  'processmaker-modeler-error-end-event',
  'processmaker-modeler-signal-end-event',
  'processmaker-modeler-terminate-end-event',
];

export default {
  components: { CrownButton },
  props: ['node', 'moddle', 'nodeRegistry'],
  data() {
    return {
      sequenceFlow: Flow,
    };
  },
  computed: {
    sequenceFlowConfig() {
      return this.nodeRegistry[genericFlowId];
    },
    nodeConfig() {
      return this.nodeRegistry[this.node.type];
    },
    allowOutgoingSequenceFlow() {
      return !dontShowOn.some((nodeType) => this.node.isType(nodeType));

      // return !this.node.isBpmnType(...sequenceFlowBlacklist) &&
      //     (this.node.isBpmnType('bpmn:EndEvent') && this.node.isType('processmaker-modeler-message-end-event'));
    },
  },
  methods: {
    addSequence(cellView, evt, x, y) {
      this.$emit('toggle-crown-state', false);
      const flowPlaceholderDefinition = this.moddle.create('bpmn:SequenceFlow', {
        name: '',
        sourceRef: this.node.definition,
        targetRef: { x, y },
      });

      this.$emit('add-node', new Node(
        genericFlowId,
        flowPlaceholderDefinition,
        this.moddle.create('bpmndi:BPMNEdge'),
      ));
    },
  },
  created() {
    this.$t = this.$t.bind(this);
  },
};
</script>
