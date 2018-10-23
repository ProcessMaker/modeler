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
        textVerticalAnchor: "middle",
        textAnchor: "middle",
        refX: "50%",
        refY: "130%",
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
  props: ["graph", "node", "id"],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      inspectorConfig: [
        {
          name: "Exclusive Gateway",
          items: [
            {
              component: "FormText",
              config: {
                label: "Exclusive Gateway",
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
                helper: "The Name of the Gateway",
                name: "name"
              }
            },
            {
              component: "FormSelect",
              config: {
                label: "Direction",
                helper: "The direction of the gateway",
                name: "gatewayDirection",
                options: [
                  {
                    value: "Diverging",
                    content: "Diverging"
                  },
                  {
                    value: "Converging",
                    content: "Converging"
                  }
                ]
              }
            }
          ]
        }
      ],
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
          text: joint.util.breakText(this.node.definition.get("name"), {
            width: 100
          }),
          fill: "black"
        }
      });
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
          this.node.definition.set('name', this.node.definition.name);
          this.node.definition.set('gatewayDirection',this.node.definition.gatewayDirection);
        }
      }

      this.updateShape();
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

