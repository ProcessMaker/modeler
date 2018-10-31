<template>
  <div>
  </div>
</template>

<script>
import joint from "jointjs";
import crownConfig from '@/mixins/crownConfig';
import connectIcon from '@/assets/connect-elements.svg';

joint.dia.Element.define(
  "processmaker.modeler.bpmn.exclusiveGateway",
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
      '<g class="rotatable"><g class="scalable"><polygon class="body"/><image/></g></g><text class="label"/>'
  }
);

export default {
  props: ["graph", "node", "nodes", "id"],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
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
      const { width } = this.shape.findView(this.paper).getBBox();
      let bounds = this.node.diagram.bounds;

      this.shape.position(bounds.x, bounds.y);
      this.shape.resize(bounds.width, bounds.height);
      this.shape.attr({
        body: {},
        ".label": {
          text: joint.util.breakText(this.node.definition.get("name"), {
            width: width
          }),
          fill: "black"
        }
      });
    },
    handleClick() {
      this.$parent.loadInspector('processmaker-modeler-exclusive-gateway', this.node.definition, this)
    }
  },
  mounted() {
    // Now, let's add a rounded rect to the graph
    this.shape = new joint.shapes.processmaker.modeler.bpmn.exclusiveGateway();
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

