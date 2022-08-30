<template>
  <crown-button
    v-if="node.isType('processmaker-modeler-text-annotation')"
    :title="$t('Association Flow')"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    id="association-flow-button"
    aria-label="Add association flow"
    role="menuitem"
    @click="addAssociation"
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
import { direction } from '@/components/nodes/association/associationConfig';
import Node from '@/components/nodes/node';

export default {
  components: { CrownButton },
  props: ['node', 'moddle', 'shape'],
  data() {
    return {
      connectIcon,
    };
  },
  methods: {
    addAssociation(cellView, evt, x, y) {
      this.$emit('toggle-crown-state', false);
      const associationLink = this.moddle.create('bpmn:Association', {
        sourceRef: this.shape.component.node.definition,
        targetRef: { x, y },
        associationDirection: direction.none,
      });

      this.$emit('add-node', new Node(
        'processmaker-modeler-association',
        associationLink,
        this.moddle.create('bpmndi:BPMNEdge'),
      ));
    },
  },
};
</script>