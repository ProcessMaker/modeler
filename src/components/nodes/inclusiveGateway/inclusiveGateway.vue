<template>
  <div>
  </div>
</template>

<script>
import joint from "jointjs";
import crownConfig from '@/mixins/crownConfig';
import connectIcon from '@/assets/connect-elements.svg';

joint.dia.Element.define(
  "processmaker.modeler.bpmn.inclusiveGateway",
  {
    size: {
      width: 80,
      height: 80
    },
    attrs: {
      ".body": {
        strokeWidth: 2,
        stroke: "#000000",
        points: "40,0, 80,40, 40,80, 0,40",
        fill: "#FFFFFF",
      },
      ".label": {
        textVerticalAnchor: "top",
        textAnchor: "middle",
        refX: "50%",
        refY: "50",
        fontSize: 14,
        fill: "#333333"
      },
      ".innerCircle": {
        strokeWidth: "3",
        cs: "25",
        cy: "75",
        r: "20",
        stroke: "black",
        fill: "transparent",
        transform: "translate(21, -16) scale(0.5)",
      },
      image: {
        width: 40,
        height: 40,
        "xlink:href": "",
        transform: "translate(20,20)"
      }
    }
  },
  {
    markup:
      '<g class="rotatable"><g class="scalable"><polygon class="body"/><image/></g></g><text class="label"/><circle class="innerCircle"/>'
  }
);

export default {
  props: ["graph", "node", "nodes", "id"],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      labelWidth: 175,
      crownConfig: [
        {
          icon: connectIcon,
          clickHandler: this.addSequence,
        },
      ],
    };
  },
  methods: {
    getShape() {
      return this.shape;
    },
    updateShape() {
      let bounds = this.node.diagram.bounds;

      this.shape.position(bounds.x, bounds.y);
      this.shape.resize(bounds.width, bounds.height);
      this.shape.attr({
        body: {},
        ".label": {
          text: joint.util.breakText(this.node.definition.get('name'), {
            width: this.labelWidth
          }),
          fill: "black"
        }
      });
    },
    handleClick() {
      this.$parent.loadInspector('processmaker-modeler-inclusive-gateway', this.node.definition, this)
    },
  },
  mounted() {
    this.shape = new joint.shapes.processmaker.modeler.bpmn.inclusiveGateway();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.attr({
      ".label": {
        text: this.node.definition.get("name"),
        fill: "black"
      }
    });
    this.shape.on("change:position", (element, position) => {
      this.node.diagram.bounds.x = position.x;
      this.node.diagram.bounds.y = position.y;
    });

    this.shape.on("change:position", (element, position) => {
      this.node.diagram.bounds.x = position.x;
      this.node.diagram.bounds.y = position.y;
      // This is done so any flows pointing to this task are updated
      this.$emit(
        "move",
        {
          x: bounds.x,
          y: bounds.y
        },
        element
      );
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
    this.$parent.nodes[this.id].component = this;

  }
};
</script>

<style lang="scss" scoped>
</style>


