<template>
  <crown-button
    v-if="node.type === 'processmaker-modeler-text-annotation'"
    :title="$t('Association Flow')"
    v-b-tooltip.hover.viewport.d50
    id="association-flow-button"
    aria-label="Add association flow"
    :src="connectIcon"
    role="menuitem"
    @click="addAssociation"
  />
</template>

<script>
import connectIcon from '@/assets/connect-artifacts.svg';
import CrownButton from '@/components/crownButton';
import { direction } from '@/components/nodes/association/associationConfig';

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
      this.$emit('show-crown', false);
      const associationLink = this.moddle.create('bpmn:Association', {
        sourceRef: this.shape.component.node.definition,
        targetRef: { x, y },
        associationDirection: direction.none,
      });

      this.$emit('add-node', {
        type: 'processmaker-modeler-association',
        definition: associationLink,
        diagram: this.moddle.create('bpmndi:BPMNEdge'),
      });
    },
  },
};
</script>
