<template>
  <crown-button
    v-if="allowOutgoingSequenceFlow"
    id="generic-flow-button"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
    :title="$t('Flow')"
    aria-label="Create a flow"
    :src="sequenceFlow"
    role="menuitem"
    @click="addSequence"
  />
</template>
<script>
import Flow from "!!svg-inline-loader!@/assets/connect-elements.svg";
import CrownButton from "@/components/crown/crownButtons/crownButton.vue";
import Node from "@/components/nodes/node";
import { id as genericFlowId } from "@/components/nodes/genericFlow/config";

// Don't show the magic flow button on:
const dontShowOn = [
  "processmaker-modeler-data-object",
  "processmaker-modeler-data-store",
  "processmaker-modeler-lane",
  "processmaker-modeler-end-event",
  "processmaker-modeler-error-end-event",
  "processmaker-modeler-signal-end-event",
  "processmaker-modeler-terminate-end-event",
  "processmaker-modeler-text-annotation",
  "processmaker-modeler-sequence-flow",
];

export default {
  components: { CrownButton },
  props: ["node", "moddle", "nodeRegistry"],
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
  created() {
    this.$t = this.$t.bind(this);
  },
  methods: {
    addSequence(cellView, evt, x, y) {
      this.$emit("toggle-crown-state", false);
      const flowPlaceholderDefinition = this.moddle.create("bpmn:SequenceFlow", {
        name: "",
        sourceRef: this.node.definition,
        targetRef: { x, y },
      });

      this.$emit("add-node", new Node(genericFlowId, flowPlaceholderDefinition, this.moddle.create("bpmndi:BPMNEdge")));
    },
  },
};
</script>
