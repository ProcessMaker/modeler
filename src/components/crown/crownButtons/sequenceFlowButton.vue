<template>
  <crown-button
    v-if="allowOutgoingSequenceFlow"
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

const sequenceFlowBlacklist = [
  'bpmn:EndEvent',
  'bpmn:MessageFlow',
  'bpmn:SequenceFlow',
  'bpmn:Participant',
  'bpmn:Lane',
  'bpmn:TextAnnotation',
  'bpmn:Association',
  'bpmn:DataObjectReference',
  'bpmn:DataStoreReference',
];

export default {
  components: { CrownButton },
  props: ['node', 'moddle', 'nodeRegistry'],
  data() {
    return {
      sequenceFlow,
    };
  },
  computed: {
    sequenceFlowConfig() {
      return this.nodeRegistry['processmaker-modeler-sequence-flow'];
    },
    nodeConfig() {
      return this.nodeRegistry[this.node.type];
    },
    allowOutgoingSequenceFlow() {
      return !this.node.isBpmnType(...sequenceFlowBlacklist);
    },
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
