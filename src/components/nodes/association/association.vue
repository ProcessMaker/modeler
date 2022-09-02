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
import { shapes } from "jointjs";
import linkConfig from "@/mixins/linkConfig";
import get from "lodash/get";
import associationHead from "!!svg-inline-loader!@/assets/association-head.svg";
import CrownConfig from "@/components/crown/crownConfig/crownConfig.vue";
import { direction } from "./associationConfig";

export default {
  components: {
    CrownConfig
  },
  mixins: [linkConfig],
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
      initialAssociationDirection: this.node.definition.associationDirection,
      associationDirection: direction
    };
  },
  computed: {
    isValidConnection() {
      const targetType = get(this.target, "component.node.type");

      if (!targetType) {
        return false;
      }

      const targetPool = this.target.component.node.pool;
      const sourcePool = this.sourceShape.component.node.pool;

      /* If the link source is part of a pool, only allow sequence
       * flows to the target if the target is also in the same pool  */
      if (sourcePool && sourcePool !== targetPool) {
        return false;
      }
      const invalidIncoming =
        this.targetConfig.validateAssociationIncoming && !this.targetConfig.validateAssociationIncoming(this.sourceNode);

      const invalidOutgoing =
        this.sourceConfig.validateAssociationOutgoing && !this.sourceConfig.validateAssociationOutgoing(this.targetNode);

      return !(invalidIncoming || invalidOutgoing);
    }
  },
  watch: {
    "node.definition.associationDirection": function (directionn) {
      this.updateAssociationMarker(directionn);
    }
  },
  mounted() {
    this.shape = new shapes.standard.Link({ router: { name: "normal" } });
    this.shape.attr({
      line: {
        stroke: "black",
        strokeWidth: "4",
        strokeLinecap: "round",
        strokeDasharray: "1, 8",
        strokeDashoffset: "5",
        targetMarker: {
          type: "image",
          "xlink:href": associationHead,
          width: 20,
          height: 20,
          y: -10
        },
        sourceMarker: {
          type: "image",
          "xlink:href": associationHead,
          width: 20,
          height: 20,
          y: -10
        }
      }
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
    this.updateAssociationMarker(this.initialAssociationDirection);
  },
  methods: {
    updateRouter() {
      this.shape.router("normal", { elementPadding: this.elementPadding });
    },
    updateDefinitionLinks() {
      const targetShape = this.shape.getTargetElement();
      this.node.definition.targetRef = targetShape.component.node.definition;
    },
    updateAssociationMarker(directionn) {
      if (directionn === this.associationDirection.none) {
        this.shape.attr("line/targetMarker/display", "none");
        this.shape.attr("line/sourceMarker/display", "none");
      }

      if (directionn === this.associationDirection.one) {
        this.shape.attr("line/targetMarker/display", "block");
        this.shape.attr("line/sourceMarker/display", "none");
      }

      if (directionn === this.associationDirection.both) {
        this.shape.attr("line/targetMarker/display", "block");
        this.shape.attr("line/sourceMarker/display", "block");
      }
    }
  }
};
</script>
