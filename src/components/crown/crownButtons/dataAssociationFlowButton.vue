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
import * as dataOutputConfig from '@/components/nodes/dataOutputAssociation/config';
import * as dataInputConfig from '@/components/nodes/dataInputAssociation/config';

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

      const comingFromDataStoreOrDataObject = this.node.isBpmnType('bpmn:DataStoreReference', 'bpmn:DataObjectReference');

      const dataAssociationConfig = comingFromDataStoreOrDataObject
        ? dataInputConfig
        : dataOutputConfig;

      const associationLink = dataAssociationConfig.definition(this.moddle);

      this.shape.component.node.definition.set('dataOutputAssociations', [associationLink]);

      // eslint-disable-next-line no-console
      console.log({'ideee': dataAssociationConfig.id});

      this.$emit('add-node', new Node(
        dataAssociationConfig.id,
        associationLink,
        dataAssociationConfig.diagram(this.moddle),
      ));
    },
  },
};
</script>
