<template>
  <crown-button
    v-if="allowOutgoingDataAssociationFlow"
    :title="$t('Data Association Flow')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    id="association-flow-button"
    aria-label="Add association flow"
    role="menuitem"
    @click="addDataAssociation"
  >
    <img
      :src="connectIcon"
      aria-hidden="true"
    >
  </crown-button>
</template>

<script>
import connectIcon from '@/assets/connect-artifacts.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';
import Node from '@/components/nodes/node';
import * as dataOutputConfig from '@/components/nodes/dataOutputAssociation/config';
import * as dataInputConfig from '@/components/nodes/dataInputAssociation/config';
import DataAssociation from '@/components/nodes/genericFlow/DataAssociation';

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
      return DataAssociation.isADataNode(this.node);
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

      const node = new Node(
        dataAssociationConfig.id,
        associationLink,
        dataAssociationConfig.diagram(this.moddle),
      );

      node.dataAssociationProps = {
        sourceShape: this.shape,
        targetCoords: { x: undefined, y: undefined },
      };

      this.$emit('add-node', node);
    },
  },
};
</script>
