<template>
  <crown-button
    v-if="allowOutgoingDataAssociationFlow"
    :title="$t('Data Association Flow')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    id="association-flow-button"
    aria-label="Add association flow"
    :src="connectIcon"
    role="menuitem"
    @click="addDataAssociation"
  />
</template>

<script>
import connectIcon from '@/assets/connect-artifacts.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';
import Node from '@/components/nodes/node';

const dataAssociationFlowBlacklist = [
  'bpmn:EndEvent',
  'bpmn:MessageFlow',
  'bpmn:SequenceFlow',
  'bpmn:Participant',
  'bpmn:Lane',
  'bpmn:TextAnnotation',
  'bpmn:Association',
];

export default {
  components: { CrownButton },
  props: ['node', 'moddle', 'shape'],
  data() {
    return {
      connectIcon,
    };
  },
  computed: {
    allowOutgoingDataAssociationFlow() {
      return !this.node.isBpmnType(...dataAssociationFlowBlacklist);
    },
  },
  methods: {
    addDataAssociation() {
      this.$emit('toggle-crown-state', false);

      const associationLink = this.moddle.create('bpmn:DataOutputAssociation', {
        targetRef: { x: undefined, y: undefined },
      });

      this.shape.component.node.definition.set('dataOutputAssociations', [associationLink]);

      this.$emit('add-node', new Node(
        'processmaker-modeler-data-association',
        associationLink,
        this.moddle.create('bpmndi:BPMNEdge'),
      ));
    },
  },
};
</script>
