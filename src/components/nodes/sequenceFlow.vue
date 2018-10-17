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
      validConnections: {
        task: ['task', 'endEvent'],
        startEvent: ['task', 'endEvent'],
        exclusiveGateway: ['task', 'endEvent'],
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
    }
  },
  methods: {
    handleClick() {
      this.$parent.setInspector(this.node.definition, this.inspectorConfig);
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
      const points = [connections.start, ...connections.segments.map(segment => segment.end)];

      this.node.diagram.waypoint = points.map(point => moddle.create('dc:Point', point));
      this.updateCrownPosition();
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

      this.shape.target(target);
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
    this.sourceShape = this.$parent.nodes[this.node.definition.get('sourceRef').get('id')].component.shape;
    const targetPoint = this.node.definition.get('targetRef');

    this.paper.setInteractivity(false);
    this.shape = new joint.shapes.standard.Link({ router: { name: 'orthogonal' } });
    this.shape.attr({ wrapper: { cursor: 'not-allowed' } });
    this.shape.source(this.sourceShape);
    this.shape.target(targetPoint);
    this.shape.addTo(this.graph);

    this.paper.el.addEventListener('mousemove', this.updateLinkTarget);
    this.paper.el.style.cursor = 'not-allowed';
    this.shape.listenToOnce(this.paper, 'blank:pointerclick link:pointerclick', this.removeLink);

    this.shape.component = this;
    this.$parent.nodes[this.id].component = this;
  },
  destroyed() {
    this.updateWaypoints.cancel();
  }
};
</script>

<style lang="scss" scoped>
</style>

