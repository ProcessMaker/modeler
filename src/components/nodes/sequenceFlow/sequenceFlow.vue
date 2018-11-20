<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import pull from 'lodash/pull';
import { gatewayDirectionOptions } from '../exclusiveGateway/index';
import { validNodeColor, invalidNodeColor, defaultNodeColor } from '@/components/nodeColors';

export default {
  props: ['graph', 'node', 'id'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      sourceShape: null,
      target: null,
      anchorPadding: 25,
      validConnections: {
        'processmaker-modeler-task': ['processmaker-modeler-task', 'processmaker-modeler-end-event', 'processmaker-modeler-exclusive-gateway', 'processmaker-modeler-inclusive-gateway', 'processmaker-modeler-parallel-gateway'],
        'processmaker-modeler-start-event': ['processmaker-modeler-task', 'processmaker-modeler-end-event'],
        'processmaker-modeler-exclusive-gateway': ['processmaker-modeler-task', 'processmaker-modeler-end-event'],
        'processmaker-modeler-inclusive-gateway': ['processmaker-modeler-task', 'processmaker-modeler-end-event'],
        'processmaker-modeler-parallel-gateway': ['processmaker-modeler-task', 'processmaker-modeler-end-event'],
      },
    };
  },
  computed: {
    sourceType() {
      return this.sourceShape && this.sourceShape.component.node.type;
    },
    elementPadding() {
      return this.shape && this.shape.source().id === this.shape.target().id ? 20 : 1;
    },
  },
  methods: {
    handleClick() {
      this.$parent.loadInspector('processmaker-modeler-sequence-flow', this.node.definition, this);
    },
    updateShape() {},
    setBodyColor(color, target = this.target) {
      target.attr('body/fill', color);
      target.attr('.body/fill', color);
    },
    completeLink() {
      this.shape.stopListening(this.paper, 'cell:mouseleave');
      this.shape.stopListening(this.paper, 'blank:pointerclick link:pointerclick', this.removeLink);
      this.$emit('set-cursor', null);

      this.resetPaper();

      const targetShape = this.shape.getTargetElement();

      this.node.definition.targetRef = targetShape.component.node.definition;
      this.sourceShape.component.node.definition.get('outgoing').push(this.node.definition);
      targetShape.component.node.definition.get('incoming').push(this.node.definition);

      this.updateWaypoints();

      this.setBodyColor(defaultNodeColor, targetShape);

      this.shape.listenTo(this.sourceShape, 'change:position', this.updateWaypoints);
      this.shape.listenTo(targetShape, 'change:position', this.updateWaypoints);
    },
    isValidGatewayConnection() {
      const definition = this.target.component.node.definition;
      const gatewayDirection = definition.get('gatewayDirection');
      const incomingFlowCount = definition.get('incoming').length;
      const outgoingFlowCount = definition.get('outgoing').length;

      if (gatewayDirection == gatewayDirectionOptions.Converging) {
        return true;
      }

      // Exclusive gateway can only recieve one incoming link
      // If the node has an outgoing link only then it can recieve a incoming link
      if (incomingFlowCount === 0 || outgoingFlowCount > 0) {
        return true;
      }

      return false;
    },
    updateWaypoints() {
      const connections = this.shape.findView(this.paper).getConnection();
      const points = connections.segments.map(segment => segment.end);

      this.node.diagram.waypoint = points.map(point => this.$parent.moddle.create('dc:Point', point));
      this.updateCrownPosition();
    },
    isValidConnection() {
      const targetType = get(this.target, 'component.node.type');

      if (!targetType) {
        return false;
      }

      const targetPool = this.target.component.node.pool;
      const sourcePool = this.sourceShape.component.node.pool;

      /* If the link source is part of a pool, only allow sequence
       * flows to the target if the target is also in the same pool  */
      if (sourcePool && sourcePool !== targetPool) {
        return false;
      }

      if (!this.validConnections[this.sourceType].includes(targetType)) {
        return false;
      }

      if (targetType === 'processmaker-modeler-exclusive-gateway') {
        return this.isValidGatewayConnection();
      }

      return true;
    },
    updateRouter() {
      this.shape.router('orthogonal', { elementPadding: this.elementPadding });
    },
    updateLinkTarget({ clientX, clientY }) {
      const localMousePosition = this.paper.clientToLocalPoint({ x: clientX, y: clientY });

      /* Sort shapes by z-index descending; grab the shape on top (with the highest z-index) */
      this.target = this.graph.findModelsFromPoint(localMousePosition).sort((shape1, shape2) => {
        return shape2.get('z') - shape1.get('z');
      })[0];

      if (!this.isValidConnection()) {
        this.$emit('set-cursor', 'not-allowed');

        this.shape.target({
          x: localMousePosition.x,
          y: localMousePosition.y,
        });

        if (this.target) {
          this.setBodyColor(invalidNodeColor);
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

      this.$emit('set-cursor', 'default');
      this.setBodyColor(validNodeColor);

      this.paper.el.removeEventListener('mousemove', this.updateLinkTarget);
      this.shape.listenToOnce(this.paper, 'cell:pointerclick', this.completeLink);

      this.shape.listenToOnce(this.paper, 'cell:mouseleave', () => {
        this.paper.el.addEventListener('mousemove', this.updateLinkTarget);
        this.shape.stopListening(this.paper, 'cell:pointerclick', this.completeLink);

        this.setBodyColor(defaultNodeColor);
        this.$emit('set-cursor', 'not-allowed');
      });
    },
    removeLink() {
      this.removeShape();
      this.resetPaper();
    },
    resetPaper() {
      this.$emit('set-cursor', null);
      this.paper.el.removeEventListener('mousemove', this.updateLinkTarget);
      this.paper.setInteractivity(this.graph.get('interactiveFunc'));

      if (this.target) {
        this.setBodyColor(defaultNodeColor);
      }
    },
  },
  created() {
    this.updateWaypoints = debounce(this.updateWaypoints, 100);
  },
  watch: {
    target(target, previousTarget) {
      if (previousTarget && previousTarget !== target) {
        this.setBodyColor(defaultNodeColor, previousTarget);
      }
    },
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
      this.paper.el.addEventListener('mousemove', this.updateLinkTarget);
      this.shape.listenToOnce(this.paper, 'blank:pointerclick link:pointerclick', this.removeLink);

      this.$emit('set-cursor', 'not-allowed');
    }

    this.updateRouter();
  },
  destroyed() {
    /* Modify source and target refs to remove incoming and outgoing properties pointing to this link */
    const sourceNode = this.$parent.nodes[this.node.definition.sourceRef.id];
    const targetNode = this.$parent.nodes[this.node.definition.targetRef.id];

    if (sourceNode) {
      pull(sourceNode.definition.get('outgoing'), this.node.definition);
    }

    if (targetNode) {
      pull(targetNode.definition.get('incoming'), this.node.definition);
    }

    this.updateWaypoints.cancel();
  },
};
</script>
