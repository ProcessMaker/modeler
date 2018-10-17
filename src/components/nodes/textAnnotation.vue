<template>
  <div>
  </div>
</template>

<script>
import joint from "jointjs";
import connectIcon from '@/assets/connect-elements.svg';
import crownConfig from '@/mixins/crownConfig';

export default {
  props: ["graph", "node", "id"],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      nodeWidth: 10,
      inspectorConfig: [
        {
          name: "Text Annotation",
          items: [
            {
              component: "FormText",
              config: {
                label: "Text Annotation",
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
                label: "Annotation Description",
                helper: "Body of the text annotation",
                text: "text"
              }
            }
          ]
        }
      ],
      crownConfig: [
        {
          icon: connectIcon,
          clickHandler() {
            /* TODO: Link item */
          },
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
      this.shape.resize(this.nodeWidth, bounds.height);
      this.shape.attr({
        body: {
          refPoints: '25 30 3 30 3 3 25 3',
        },
        label: {
          text: joint.util.breakText(this.node.definition.get("text"), {
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
          this.node.definition.set('text', value[key])
        }
      }

      this.updateShape();
    }
  },
  mounted() {
    this.shape = new joint.shapes.standard.Polyline();

    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(this.nodeWidth, bounds.height);
    this.shape.attr({
      body: {
        refPoints: '25 30 3 30 3 3 25 3',
      },
      label: {
        text: joint.util.breakText(this.node.definition.get("text"), {
          width: bounds.width,
        }),
        fill: "black",
        yAlignment: 'left',
        xAlignment: 'left',
        refX: '5',
        refY: '5',
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
  }
};
</script>
