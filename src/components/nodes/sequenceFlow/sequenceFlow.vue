<template>
    <div>
    </div>
</template>

<script>
import joint from "jointjs";
import crownConfig from '@/mixins/crownConfig';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import BpmnModdle from 'bpmn-moddle'

let moddle = new BpmnModdle;

export default {
  props: ["graph", "node", "id"],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      sourceShape: null,
      anchorPadding: 25,
      validConnections: {
        'processmaker-modeler-task': ['processmaker-modeler-task', 'processmaker-modeler-end-event', 'processmaker-modeler-exclusive-gateway'],
        'processmaker-modeler-start-event': ['processmaker-modeler-task', 'processmaker-modeler-end-event'],
        'processmaker-modeler-exclusive-gateway': ['processmaker-modeler-task', 'processmaker-modeler-end-event'],
      },
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
                helper: "The Name of the Sequence Flow",
                name: "name"
              }
            },
            {
              component: "FormInput",
              config: {
                label: "Expression",
                helper: "The condition expression for this sequence flow. Only used if used with a diverging gateway",
                name: "conditionExpression.body"
              }
            }

          ]
        }
      ]
    };
  },
  computed: {
    sourceType() {
      return this.sourceShape && this.sourceShape.component.node.type;
    },
    elementPadding() {
      return this.shape && this.shape.source().id === this.shape.target().id ? 20 : 1;
    }
  },
  methods: {
    handleClick() {
      this.$parent.loadInspector('processmaker-modeler-sequence-flow', this.node.definition, this)
    },
    updateShape() {},
    completeLink() {
      this.shape.stopListening(this.paper, 'cell:mouseleave');
      this.shape.stopListening(this.paper, 'blank:pointerclick link:pointerclick', this.removeLink);
      this.shape.attr({ wrapper: { cursor: 'default' } });

      this.resetPaper();

      const targetShape = this.shape.getTargetElement();

      this.node.definition.targetRef = targetShape.component.node.definition;
      this.sourceShape.component.node.definition.get('outgoing').push(this.node.definition);
      targetShape.component.node.definition.get('incoming').push(this.node.definition)

      this.updateWaypoints();

      targetShape.attr({
        body: { fill: '#fff', cursor: 'move' },
        label: { cursor: 'move' },
      });

      this.shape.listenTo(this.sourceShape, 'change:position', this.updateWaypoints);
      this.shape.listenTo(targetShape, 'change:position', this.updateWaypoints);
    },
    updateWaypoints() {
      const connections = this.shape.findView(this.paper).getConnection();
      const points = connections.segments.map(segment => segment.end);

      this.node.diagram.waypoint = points.map(point => moddle.create('dc:Point', point));
      this.updateCrownPosition();
    },
    updateRouter() {
      this.shape.router('orthogonal', { elementPadding: this.elementPadding });
    },
    updateLinkTarget({ clientX, clientY }) {
      const localMousePosition = this.paper.clientToLocalPoint({ x: clientX, y: clientY });
      const [target] = this.graph.findModelsFromPoint(localMousePosition);
      const targetType = get(target, 'component.node.type');

      if (!targetType || !this.validConnections[this.sourceType].includes(targetType)) {
        this.shape.target({
          x: localMousePosition.x,
          y: localMousePosition.y,
        });
        return;
      }

      this.shape.target(target, {
        anchor: {
          name: target instanceof joint.shapes.standard.Rectangle ? 'perpendicular' : 'modelCenter',
          args: { padding: this.anchorPadding },
        },
        connectionPoint: { name: 'boundary' },
      });

      this.updateRouter();

      target.attr({
        body: { fill: '#dffdd0', cursor: 'default' },
        label: { cursor: 'default' },
      });

      this.paper.el.removeEventListener('mousemove', this.updateLinkTarget);
      this.shape.listenToOnce(this.paper, 'cell:pointerclick', this.completeLink);

      this.shape.listenToOnce(this.paper, 'cell:mouseleave', () => {
        this.paper.el.addEventListener('mousemove', this.updateLinkTarget);
        this.shape.stopListening(this.paper, 'cell:pointerclick', this.completeLink);

        target.attr({
          body: { fill: '#fff', cursor: 'move' },
          label: { cursor: 'move' },
        });
      });
    },
    removeLink() {
      this.removeShape();
      this.resetPaper();
    },
    resetPaper() {
      this.paper.el.style.cursor = 'default';
      this.paper.el.removeEventListener('mousemove', this.updateLinkTarget);
      this.paper.setInteractivity(this.graph.get('interactiveFunc'));
    },
  },
  created() {
    this.updateWaypoints = debounce(this.updateWaypoints, 100);
  },
  mounted() {
    this.shape = new joint.shapes.standard.Link({
      router: {
        name: 'orthogonal',
        args: {
          elementPadding: this.elementPadding,
        },
      },
    });

    this.sourceShape = this.$parent.nodes[this.node.definition.get('sourceRef').get('id')].component.shape;

    this.shape.source(this.sourceShape, {
      anchor: { name: 'modelCenter' },
      connectionPoint: { name: 'boundary' },
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
    this.$parent.nodes[this.id].component = this;

    const targetRef = this.node.definition.get('targetRef');

    if (targetRef.id) {
      const targetShape = this.$parent.nodes[targetRef.get('id')].component.shape;
      this.shape.target(targetShape, {
        anchor: {
          name: targetShape instanceof joint.shapes.standard.Rectangle ? 'perpendicular' : 'modelCenter',
          args: { padding: this.anchorPadding },
        },
        connectionPoint: { name: 'boundary' },
      });

      this.completeLink();
    } else {
      this.shape.target(targetRef, {
        connectionPoint: { name: 'boundary' },
      });

      this.paper.setInteractivity(false);
      this.shape.attr({ wrapper: { cursor: 'not-allowed' } });

      this.paper.el.addEventListener('mousemove', this.updateLinkTarget);
      this.paper.el.style.cursor = 'not-allowed';
      this.shape.listenToOnce(this.paper, 'blank:pointerclick link:pointerclick', this.removeLink);
    }

    this.updateRouter();
  },
  destroyed() {
    this.updateWaypoints.cancel();
  }
};
</script>

<style lang="scss" scoped>
</style>

