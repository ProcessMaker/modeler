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
    v-on="$listeners"
  />
</template>

<script>
import { shapes, util } from "jointjs";
import resizeConfig from "@/mixins/resizeConfig";
import pull from "lodash/pull";
import { poolColor } from "@/components/nodeColors";
import CrownConfig from "@/components/crown/crownConfig/crownConfig";
import highlightConfig from "@/mixins/highlightConfig";
import { labelWidth } from "../pool/poolSizes";

export default {
  components: {
    CrownConfig
  },
  mixins: [highlightConfig, resizeConfig],
  props: [
    "graph",
    "node",
    "nodes",
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
      definition: null
    };
  },
  watch: {
    "node.definition.name": function (name) {
      this.shape.attr("label/text", name);
    }
  },
  mounted() {
    this.shape = new shapes.standard.Rectangle();
    this.shape.set("type", "PoolLane");
    const { bounds } = this.node.diagram;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);

    this.shape.set("elementMove", false);
    this.shape.attr("body/cursor", "default");
    this.shape.attr("body", {
      fill: poolColor
    });
    this.shape.attr("label", {
      text: util.breakText(this.node.definition.get("name"), { width: bounds.height }),
      fill: "black",
      transform: "rotate(-90)",
      refX: labelWidth / 2
    });

    this.shape.component = this;
    this.shape.addTo(this.graph);

    if (!this.planeElements.includes(this.node.diagram)) {
      this.planeElements.push(this.node.diagram);
    }
  },
  beforeDestroy() {
    /* Resize the parent pool to fill in the space where the lane was deleted.
     * If this was the 2nd last lane, remove all lanes and revert the pool back to normal. */

    const poolComponent = this.node.pool.component;
    const lanes = poolComponent.laneSet.get("lanes");

    pull(lanes, this.node.definition);

    if (lanes.length === 0) {
      /* Last lane being removed; remove laneSet */
      poolComponent.containingProcess.set("laneSets", []);
      poolComponent.laneSet = null;
    }
  }
};
</script>
