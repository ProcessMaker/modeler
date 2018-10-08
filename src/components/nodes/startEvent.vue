<template>
    <div>
    </div>
</template>

<script>
import joint from "jointjs";

export default {
  props: ["graph", "node", "id"],
  data() {
    return {
      shape: null,
      definition: null,
      inspectorConfig: [
        {
          name: "Start Event",
          items: [
            {
              component: "FormText",
              config: {
                label: "Start Event",
                fontSize: "2em"
              }
            },
            {
              component: "FormInput",
              config: {
                label: "Identifier",
                helper:
                  "The id field should be unique across all elements in the diagram",
                name: "id"
              }
            },
            {
              component: "FormInput",
              config: {
                label: "Name",
                helper: "The Name of the Start Event",
                name: "name"
              }
            }
          ]
        }
      ]
    };
  },
  methods: {
    getShape() {
      return this.shape;
    },
    handleClick() {
      this.$parent.setInspector(
        this.node.definition,
        this.inspectorConfig,
        this.handleInspectionUpdate
      );
    },
    handleInspectionUpdate(value) {
      // Go through each property and rebind it to our data
      for (var key in value) {
        // Only change if the value is different
        if (this.node.definition[key] != value[key]) {
          this.node.definition[key] = value[key];
        }
      }
      this.updateShape();
    },
    updateShape() {
      let bounds = this.node.diagram.bounds;
      this.shape.position(bounds.x, bounds.y);
      this.shape.resize(bounds.width, bounds.height);
      this.shape.attr({
        body: {},
        label: {
          text: this.node.definition.get("name"),
          fill: "black"
        }
      });
    },

  },
  mounted() {
    // Now, let's add a rounded rect to the graph
    this.shape = new joint.shapes.standard.Circle();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.get("x"), bounds.get("y"));
    this.shape.resize(bounds.get("width"), bounds.get("height"));
    this.shape.attr({
      body: {
        stroke: "#00bf9c",
        fill: "#EDFFFC"
      },
      label: {
        text: this.node.definition.get("name"),
        refY: "130%",
      }
    });
    this.shape.addTo(this.graph);
    this.shape.component = this;

    this.$parent.nodes[this.id].component = this;
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
  }
};
</script>

<style lang="scss" scoped>
</style>

