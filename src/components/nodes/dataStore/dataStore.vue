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
import highlightConfig from "@/mixins/highlightConfig";
import hideLabelOnDrag from "@/mixins/hideLabelOnDrag";
import portsConfig from "@/mixins/portsConfig";
import CrownConfig from "@/components/crown/crownConfig/crownConfig.vue";
import DataStoreShape from "./shape";

export default {
  components: {
    CrownConfig
  },
  mixins: [highlightConfig, hideLabelOnDrag, portsConfig],
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
      dropdownData: []
    };
  },
  watch: {
    "node.definition.name": function (name) {
      this.shape.attr("label/text", name);
    }
  },
  mounted() {
    this.shape = new DataStoreShape();
    this.shape.attr("label/text", this.node.definition.get("name"));

    const { bounds } = this.node.diagram;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.addTo(this.graph);
    this.shape.component = this;
  }
};
</script>
