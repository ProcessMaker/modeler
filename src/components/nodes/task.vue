<template>
  <div>
  </div>
</template>

<script>
import joint from "jointjs";
import connectIcon from '@/assets/connect-elements.svg';
import crownConfig from '@/mixins/crownConfig';

export default {
  props: ["graph", "node", "nodes", "id"],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      inspectorConfig: [
        {
          name: "Task",
          items: [
            {
              component: "FormText",
              config: {
                label: "Task",
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
                helper: "The Name of the Task",
                name: "name"
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
        label: {
          text: joint.util.breakText(this.node.definition.get("name"), {
            width: bounds.width
          }),
          fill: "black"
        }
      });
      // Alert anyone that we have moved
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
    }
  },
  mounted() {
    this.shape = new joint.shapes.standard.Rectangle();

    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.attr({
      body: {
        rx: 8,
        ry: 8
      },
      label: {
        text: joint.util.breakText(this.node.definition.get("name"), {
          width: bounds.width
        }),
        fill: "black"
      },
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
  },
};
</script>
