<template>
  <crown-config
    :highlighted="highlighted"
    :paper="paper"
    :graph="graph"
    :shape="shape"
    :node="node"
    :node-registry="nodeRegistry"
    :moddle="moddle"
    :collaboration="collaboration"
    :process-node="processNode"
    :plane-elements="planeElements"
    :is-rendering="isRendering"
    :dropdown-data="dropdownData"
    v-on="$listeners"
  />
</template>

<script>
import portsConfig from "@/mixins/portsConfig";
import GatewayShape from "@/components/nodes/gateway/shape";
import hideLabelOnDrag from "@/mixins/hideLabelOnDrag";
import CrownConfig from "@/components/crown/crownConfig/crownConfig";
import highlightConfig from "@/mixins/highlightConfig";
import defaultNames from "@/components/nodes/gateway/defaultNames";

const hasDefaultFlow = ["bpmn:ExclusiveGateway", "bpmn:InclusiveGateway"];

export default {
  components: {
    CrownConfig
  },
  mixins: [highlightConfig, portsConfig, hideLabelOnDrag],
  props: [
    "graph",
    "node",
    "id",
    "highlighted",
    "nodeRegistry",
    "moddle",
    "paper",
    "collaboration",
    "processNode",
    "planeElements",
    "isRendering"
  ],
  data() {
    return {
      shape: null,
      definition: null,
      labelWidth: 175,
      dropdownData: [
        {
          label: defaultNames["processmaker-modeler-exclusive-gateway"],
          nodeType: "processmaker-modeler-exclusive-gateway"
        },
        {
          label: defaultNames["processmaker-modeler-inclusive-gateway"],
          nodeType: "processmaker-modeler-inclusive-gateway",
          dataTest: "switch-to-inclusive-gateway"
        },
        {
          label: defaultNames["processmaker-modeler-parallel-gateway"],
          nodeType: "processmaker-modeler-parallel-gateway",
          dataTest: "switch-to-parallel-gateway"
        },
        {
          label: defaultNames["processmaker-modeler-event-based-gateway"],
          nodeType: "processmaker-modeler-event-based-gateway",
          dataTest: "switch-to-event-based-gateway",
          disabled(node) {
            if (node && node.definition && node.definition.outgoing) {
              const validTypes = ["bpmn:IntermediateCatchEvent"];
              const invalid = node.definition.outgoing.find((flow) => !validTypes.includes(flow.targetRef.$type));
              return invalid ? "It must be connected only to catch events" : false;
            }
            return false;
          }
        }
      ]
    };
  },
  watch: {
    "node.definition.name": function (name) {
      this.shape.attr("label/text", name);
    }
  },
  created() {
    const flow = this.node.definition.default || null;
    delete this.node.definition.default;
    if (hasDefaultFlow.indexOf(this.node.definition.$type) > -1) {
      this.$set(this.node.definition, "default", flow);
    }
  },
  mounted() {
    this.shape = new GatewayShape();
    const { bounds } = this.node.diagram;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.attr({
      label: {
        text: this.node.definition.get("name"),
        fill: "black"
      }
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
  }
};
</script>
