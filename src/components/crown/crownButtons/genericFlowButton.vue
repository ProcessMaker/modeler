<template>
  <crown-button
    v-if="allowOutgoingSequenceFlow"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    :title="$t('Flow')"
    id="generic-flow-button"
    aria-label="Create a flow"
    role="menuitem"
    @click="addSequence"
  >
    <font-awesome-icon :icon="['fpm', 'fa-connect-elements']"/>
  </crown-button>
</template>
<script>
import Flow from '@/assets/connect-elements.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';
import Node from '@/components/nodes/node';
import { id as genericFlowId } from '@/components/nodes/genericFlow/config';
import store from '@/store';
import { V } from 'jointjs';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faConnectElements } from './icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Don't show the magic flow button on:
const dontShowOn = [
  'processmaker-modeler-data-object',
  'processmaker-modeler-data-store',
  'processmaker-modeler-lane',
  'processmaker-modeler-end-event',
  'processmaker-modeler-error-end-event',
  'processmaker-modeler-signal-end-event',
  'processmaker-modeler-terminate-end-event',
  'processmaker-modeler-text-annotation',
  'processmaker-modeler-sequence-flow',
  'processmaker-modeler-message-flow',
];

export default {
  components: { CrownButton, FontAwesomeIcon },
  props: ['node', 'moddle', 'nodeRegistry'],
  data() {
    return {
      sequenceFlow: Flow,
    };
  },
  computed: {
    paper: () => store.getters.paper,
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
      const { clientX, clientY } = cellView;
      let point = null;
      if (cellView){
        point = V(this.paper.viewport).toLocalPoint(clientX, clientY);
      }
      const flowPlaceholderDefinition = this.moddle.create('bpmn:SequenceFlow', {
        name: '',
        sourceRef: this.node.definition,
        targetRef: {
          x: x ? x : point.x,
          y: y ? y : point.y,
        },
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
    library.add(faConnectElements);
  },
};
</script>