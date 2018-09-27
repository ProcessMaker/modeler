<template>
    <div>
        <b-modal ref="configuremodal" title="Task Configuration Test Modal">
            <p class="my-4">Hello from task configuration modal!</p>
        </b-modal>
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
          name: "Task",
          items: [
            {
                component: 'FormText',
                config: {
                    label: 'Task',
                    fontSize: '2em'
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
      ]
    };
  },
  methods: {
    getShape() {
      return this.shape;
    },
    updateShape() {
      let bounds = this.node.diagram.bounds;
      this.shape.position(bounds.get("x"), bounds.get("y"));
      this.shape.resize(bounds.get("width"), bounds.get("height"));
      this.shape.attr({
        body: {
        },
        label: {
          text: this.node.definition.get("name"),
          fill: "black"
        }
      });
    },
    handleClick() {
      this.$parent.setInspector(this.node.definition, this.inspectorConfig);
    }
  },
  mounted() {
    // Now, let's add a rounded rect to the graph
    this.shape = new joint.shapes.standard.Rectangle();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.get("x"), bounds.get("y"));
    this.shape.resize(bounds.get("width"), bounds.get("height"));
      this.shape.attr({
          body: {
              rx: 4,
              ry: 4
          },
        label: {
          text: this.node.definition.get("name"),
          fill: "black"
        }
      });
    this.shape.on('change:position', (element, position) => {
        this.node.diagram.bounds.x = position.x;
        this.node.diagram.bounds.y = position.y;
    });
    this.shape.addTo(this.graph);
    this.shape.component = this;
    this.$parent.nodes[this.id].component = this;
  }
};
</script>

<style lang="scss" scoped>
</style>

