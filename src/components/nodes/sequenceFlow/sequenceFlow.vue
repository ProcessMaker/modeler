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
      target: null,
      validNodeColor: '#dffdd0',
      invalidNodeColor: '#fae0e6',
      defaultNodeColor: '#fff',
      gatewayDirectionOptions: { Diverging: 'Diverging', Converging: 'Converging' },
      anchorPadding: 25,
      validConnections: {
        'processmaker-modeler-task': ['processmaker-modeler-task', 'processmaker-modeler-end-event', 'processmaker-modeler-exclusive-gateway'],
        'processmaker-modeler-start-event': ['processmaker-modeler-task', 'processmaker-modeler-end-event'],
        'processmaker-modeler-exclusive-gateway': ['processmaker-modeler-task', 'processmaker-modeler-end-event'],
      },
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
      targetShape.component.node.definition.get('incoming').push(this.node.definition);

      this.updateWaypoints();

      targetShape.attr({
        body: { fill: `${this.defaultNodeColor}`, cursor: 'move' },
        label: { cursor: 'move' },

        ".body": { fill: `${this.defaultNodeColor}`, cursor: 'move' },
        ".label": { cursor: 'move' },
      });

      this.shape.listenTo(this.sourceShape, 'change:position', this.updateWaypoints);
      this.shape.listenTo(targetShape, 'change:position', this.updateWaypoints);
    },
    checkExclusiveGateway() {
      const definition = this.target.component.node.definition;
      const gatewayDirection = definition.get('gatewayDirection');
      const incoming = definition.get('incoming');
      const outgoing = definition.get('outgoing');
      const incomingFlowCount = incoming.length;
      const outgoingFlowCount = outgoing.length;

      if (gatewayDirection == this.gatewayDirectionOptions.Diverging) {
        if (incomingFlowCount === 0) {
          return true;
        }
        if (outgoingFlowCount > 0){
          return true;
        }
        return false;
      } else if (gatewayDirection == this.gatewayDirectionOptions.Converging) {
        return true;
      }
    },
    nodeState( fill, cursor, target = this.target) {
      target.attr({
        body: { fill , cursor },
        label: { cursor },
        ".body": { fill, cursor },
        ".label": { cursor },
      });
    },
    updateWaypoints() {
      const connections = this.shape.findView(this.paper).getConnection();
      const points = connections.segments.map(segment => segment.end);

      this.node.diagram.waypoint = points.map(point => moddle.create('dc:Point', point));
      this.updateCrownPosition();
    },
    isValidConnection() {
      const targetType = get(this.target, 'component.node.type');

      if (!targetType) {
        return false;
      }

      if (!this.validConnections[this.sourceType].includes(targetType)) {
        return false;
      }

      if (targetType === 'processmaker-modeler-exclusive-gateway') {
        return this.checkExclusiveGateway();
      }
      return true;
    },
    updateRouter() {
      this.shape.router('orthogonal', { elementPadding: this.elementPadding });
    },
    updateLinkTarget({ clientX, clientY }) {
      const localMousePosition = this.paper.clientToLocalPoint({ x: clientX, y: clientY });

      this.target = this.graph.findModelsFromPoint(localMousePosition)[0];

      if (!this.isValidConnection()) {
        this.shape.target({
          x: localMousePosition.x,
          y: localMousePosition.y,
        });

        if (this.target) {
          this.nodeState(this.invalidNodeColor, 'not-allowed');
        }
        return;
      }

      this.shape.target(this.target, {
        anchor: {
          name: this.target instanceof joint.shapes.standard.Rectangle ? 'perpendicular' : 'modelCenter',
          args: { padding: this.anchorPadding },
        },
        connectionPoint: { name: 'boundary' },
      });

      this.updateRouter();
      this.nodeState(this.validNodeColor, 'default')
      this.paper.el.removeEventListener('mousemove', this.updateLinkTarget);
      this.shape.listenToOnce(this.paper, 'cell:pointerclick', this.completeLink);

      this.shape.listenToOnce(this.paper, 'cell:mouseleave', () => {
        this.paper.el.addEventListener('mousemove', this.updateLinkTarget);
        this.shape.stopListening(this.paper, 'cell:pointerclick', this.completeLink);
        this.nodeState(this.defaultNodeColor, 'move');
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
      this.target && this.nodeState(this.defaultNodeColor, 'not-allowed');
    },
  },
  created() {
    this.updateWaypoints = debounce(this.updateWaypoints, 100);
  },
  watch: {
    target( target , previousTarget ) {
      if (previousTarget && previousTarget !== target ) {
        this.nodeState(this.defaultNodeColor, 'default', previousTarget )
      }
    }
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
