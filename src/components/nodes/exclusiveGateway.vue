<template>
    <div>
    </div>
</template>

<script>
import joint from "jointjs";

joint.dia.Element.define('processmaker.modeler.bpmn.exclusiveGateway', {
        attrs: {
        body: {
            refWidth: '100%',
            refHeight: '100%',
            fill: 'transparent',
            strokeWidth: 0,
        },
        diamond: {
            strokeWidth: 2,
            stroke: '#000000',
            fill: '#FFFFFF',
            transform: 'rotate(45)',
            refWidth: '100%',
            refHeight: '100%'
        },
        label: {
            textVerticalAnchor: 'middle',
            textAnchor: 'middle',
            refX: '50%',
            refY: '50%',
            fontSize: 14,
            fill: '#333333'
        }
    }
}, {
    markup: [{
        tagName: 'rect',
        selector: 'body',
    }, {
        tagName: 'rect',
        selector: 'diamond'
    },
    {
        tagName: 'text',
        selector: 'label'
    }]

});

export default {
  props: ["graph", "node", "id"],
  data() {
    return {
      shape: null,
      definition: null,
      inspectorConfig: [
        {
          name: "Exclusive Gateway",
          items: [
            {
                component: 'FormText',
                config: {
                    label: 'Exclusive Gateway',
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
                helper: "The Name of the Gateway",
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
      this.shape.position(bounds.x, bounds.y);
      this.shape.resize(bounds.width, bounds.height);
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
    this.shape = new joint.shapes.processmaker.modeler.bpmn.exclusiveGateway();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
      this.shape.attr({
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

