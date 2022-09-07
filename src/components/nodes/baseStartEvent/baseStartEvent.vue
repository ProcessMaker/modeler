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
import hasMarkers from "@/mixins/hasMarkers";
import hideLabelOnDrag from "@/mixins/hideLabelOnDrag";
import { startColor, startColorStroke } from "@/components/nodeColors";
import CrownConfig from "@/components/crown/crownConfig/crownConfig.vue";
import highlightConfig from "@/mixins/highlightConfig";
import updateIconColor from "@/mixins/updateIconColor";
import defaultNames from "./defaultNames";
import EventShape from "./eventShape";

export default {
  components: {
    CrownConfig,
  },
  mixins: [highlightConfig, portsConfig, hasMarkers, hideLabelOnDrag, updateIconColor],
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
    "isRendering",
  ],
  data() {
    return {
      shape: new EventShape(),
      definition: null,
      dropdownData: [
        {
          label: defaultNames["processmaker-modeler-start-event"],
          nodeType: "processmaker-modeler-start-event",
          dataTest: "switch-to-start-event",
        },
        {
          label: defaultNames["processmaker-modeler-start-timer-event"],
          nodeType: "processmaker-modeler-start-timer-event",
          dataTest: "switch-to-start-timer-event",
        },
        {
          label: defaultNames["processmaker-modeler-signal-start-event"],
          nodeType: "processmaker-modeler-signal-start-event",
          dataTest: "switch-to-signal-start-event",
        },
        {
          label: defaultNames["processmaker-modeler-message-start-event"],
          nodeType: "processmaker-modeler-message-start-event",
          dataTest: "switch-to-message-start-event",
        },
        {
          label: defaultNames["processmaker-modeler-conditional-start-event"],
          nodeType: "processmaker-modeler-conditional-start-event",
          dataTest: "switch-to-conditional-start-event",
        },
      ],
    };
  },
  watch: {
    "node.definition.name": function (name) {
      this.shape.attr("label/text", name);
    },
  },
  mounted() {
    this.shape.set("type", "processmaker.components.nodes.startEvent.Shape");
    const { bounds } = this.node.diagram;
    this.shape.position(bounds.get("x"), bounds.get("y"));
    this.shape.resize(bounds.get("width"), bounds.get("height"));
    this.shape.attr({
      body: {
        stroke: startColorStroke,
        fill: startColor,
      },
      label: {
        text: this.node.definition.get("name"),
        refY: "130%",
      },
      image: {
        "ref-x": 5,
        "ref-y": 5,
        width: bounds.get("width") - 10,
        height: bounds.get("height") - 10,
      },
    });
    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
