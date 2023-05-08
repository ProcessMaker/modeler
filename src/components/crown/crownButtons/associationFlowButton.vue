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
import store from '@/store';
import { V } from 'jointjs';

export default {
  components: { CrownButton },
  props: ['node', 'moddle', 'shape'],
  data() {
    return {
      connectIcon,
    };
  },
  computed: {
    paper: () => store.getters.paper,
  },
  methods: {
    addAssociation(cellView, evt, x, y) {
      this.$emit('toggle-crown-state', false);
      const { clientX, clientY } = cellView;
      let point = null;
      if (cellView){
        point = V(this.paper.viewport).toLocalPoint(clientX, clientY);
      }
      const associationLink = this.moddle.create('bpmn:Association', {
        sourceRef: this.shape.component.node.definition,
        targetRef: {
          x: x ? x : point.x,
          y: y ? y : point.y,
        },
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