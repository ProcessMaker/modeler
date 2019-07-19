import joint from 'jointjs';
import pull from 'lodash/pull';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import { validNodeColor, invalidNodeColor, defaultNodeColor, poolColor } from '@/components/nodeColors';
import { portGroups } from '@/mixins/portsConfig';

function getPointFromGroup(view, group) {
  const { x: shapeX, y: shapeY } = view.model.position();
  const { x, y } = Object.values(view.model.getPortsPositions(group))[0];

  return new joint.g.Point(shapeX + x, shapeY + y);
}

function getPortPoints(view) {
  return portGroups.map(group => getPointFromGroup(view, group));
}

function closestPort(endView, anchorReference) {
  return getPortPoints(endView).sort((p1, p2) => {
    const referencePoint = new joint.g.Point(anchorReference.x, anchorReference.y);
    return referencePoint.distance(p1) - referencePoint.distance(p2);
  })[0];
}

function hasPorts(view) {
  return Object.values(view.model.getPortsPositions(portGroups[0])).length > 0;
}

function snapToAnchor(coords, endView) {
  if (!hasPorts(endView)) {
    const { x, y } = endView.model.position();
    const { width, height } = endView.model.size();

    return new joint.g.Point(x + (width / 2), y + (height / 2));
  }

  return closestPort(endView, coords);
}

const endpoints = {
  source: 'source',
  target: 'target',
};

const anchorPadding = 25;

export default {
  props: ['highlighted', 'paper'],
  data() {
    return {
      sourceShape: null,
      target: null,
      listeningToMouseup: false,
      vertices: null,
    };
  },
  watch: {
    target(target, previousTarget) {
      if (previousTarget && previousTarget !== target) {
        this.setBodyColor(poolColor, previousTarget);
      }
    },
    isValidConnection(isValid) {
      if (isValid) {
        this.shape.stopListening(this.paper, 'blank:pointerdown link:pointerdown element:pointerdown', this.removeLink);
      } else {
        this.shape.listenToOnce(this.paper, 'blank:pointerdown link:pointerdown element:pointerdown', this.removeLink);
      }
    },
    highlighted(highlighted) {
      if (highlighted) {
        this.shape.attr({
          line: { stroke: 'orange' },
          '.joint-highlight-stroke': {'display': 'none'},
        });

        this.shapeView.showTools();
      } else {
        this.shape.attr({
          line: { stroke: 'black' },
        });

        this.shapeView.hideTools();
      }
    },
  },
  computed: {
    sourceNode() {
      return get(this.sourceShape, 'component.node');
    },
    targetNode() {
      return get(this.target, 'component.node');
    },
    sourceConfig() {
      return this.sourceNode && this.nodeRegistry[this.sourceNode.type];
    },
    targetConfig() {
      return this.targetNode && this.nodeRegistry[this.targetNode.type];
    },
    elementPadding() {
      return this.shape && this.shape.source().id === this.shape.target().id ? 20 : 1;
    },
    isPoolOrLane() {
      if (!this.target) {
        return;
      }
      return ['processmaker-modeler-lane', 'processmaker-modeler-pool'].includes(this.target.component.node.type);
    },
  },
  methods: {
    setEndpoint(shape, endpoint, connectionPoint) {
      let anchor;

      if (connectionPoint) {
        anchor = () => closestPort(shape.findView(this.paper), connectionPoint);
      } else {
        anchor = {
          name: this.target instanceof joint.shapes.standard.Rectangle ? 'perpendicular' : 'modelCenter',
          args: { padding: anchorPadding },
        };
      }

      this.shape[endpoint](shape, {
        anchor,
        connectionPoint: { name: 'boundary' },
      });
    },
    setSource(sourceShape, connectionPoint) {
      this.setEndpoint(sourceShape, endpoints.source, connectionPoint);
    },
    setTarget(targetShape, connectionPoint) {
      this.setEndpoint(targetShape, endpoints.target, connectionPoint);
    },
    setBodyColor(color, target = this.target) {
      target.attr('body/fill', color);
      target.attr('.body/fill', color);
    },
    completeLink() {
      this.shape.stopListening(this.paper, 'cell:mouseleave');
      this.$emit('set-cursor', null);

      this.resetPaper();

      const targetShape = this.shape.getTargetElement();

      this.setBodyColor(defaultNodeColor, targetShape);

      if (this.isPoolOrLane)  {
        this.setBodyColor(poolColor);
      }

      this.shape.listenTo(this.sourceShape, 'change:position', this.updateWaypoints);
      this.shape.listenTo(targetShape, 'change:position', this.updateWaypoints);
      this.shape.on('change:vertices change:source change:target', this.updateWaypoints);
      this.shape.getSourceElement().embed(this.shape);
    },
    updateWaypoints() {
      const linkView = this.shape.findView(this.paper);
      const start = linkView.sourceAnchor;
      const end = linkView.targetAnchor;

      this.node.diagram.waypoint = [start, ...this.shape.vertices(), end].map(point => this.moddle.create('dc:Point', point));
      this.updateCrownPosition();

      if (!this.listeningToMouseup) {
        this.listeningToMouseup = true;
        document.addEventListener('mouseup', this.emitSave);
      }
    },
    updateLinkTarget({ clientX, clientY }) {
      const localMousePosition = this.paper.clientToLocalPoint({ x: clientX, y: clientY });

      /* Sort shapes by z-index descending; grab the shape on top (with the highest z-index) */
      this.target = this.graph.findModelsFromPoint(localMousePosition).sort((shape1, shape2) => {
        return shape2.get('z') - shape1.get('z');
      })[0];

      if (!this.isValidConnection) {
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

      this.setTarget(this.target);
      this.updateRouter();
      this.$emit('set-cursor', 'default');
      this.setBodyColor(validNodeColor);

      this.paper.el.removeEventListener('mousemove', this.updateLinkTarget);
      this.shape.listenToOnce(this.paper, 'cell:pointerclick', () => {
        this.completeLink();
        this.updateWaypoints();
        this.updateWaypoints.flush();

        if (this.updateDefinitionLinks) {
          this.updateDefinitionLinks();
        }

        this.$emit('save-state');
      });

      this.shape.listenToOnce(this.paper, 'cell:mouseleave', () => {
        this.paper.el.addEventListener('mousemove', this.updateLinkTarget);
        this.shape.stopListening(this.paper, 'cell:pointerclick');
        this.setBodyColor(defaultNodeColor);
        this.$emit('set-cursor', 'not-allowed');
      });
    },
    removeLink() {
      this.$emit('remove-node', this.node);
      this.resetPaper();
    },
    resetPaper() {
      this.$emit('set-cursor', null);
      this.paper.el.removeEventListener('mousemove', this.updateLinkTarget);
      this.paper.setInteractivity(this.graph.get('interactiveFunc'));
      if (this.target) {
        this.setBodyColor(defaultNodeColor);
      }

      if (this.isPoolOrLane)  {
        this.setBodyColor(poolColor);
      }
    },
    setupLinkTools() {
      const verticesTool = new joint.linkTools.Vertices();
      const sourceAnchorTool = new joint.linkTools.SourceAnchor({ snap: snapToAnchor });
      const targetAnchorTool = new joint.linkTools.TargetAnchor({ snap: snapToAnchor });
      const segmentsTool = new joint.linkTools.Segments();

      const toolsView = new joint.dia.ToolsView({
        tools: [verticesTool, segmentsTool, sourceAnchorTool, targetAnchorTool],
      });

      this.shapeView.addTools(toolsView);
      this.shapeView.hideTools();
    },
    emitSave() {
      if (this.highlighted) {
        this.updateWaypoints.flush();
        this.$emit('save-state');
        document.removeEventListener('mouseup', this.emitSave);
        this.listeningToMouseup = false;
      }
    },
  },
  created() {
    this.updateWaypoints = debounce(this.updateWaypoints, 100);
    this.emitSave.bind(this);
  },
  async mounted() {
    await this.$nextTick();
    /* Use nextTick to ensure this code runs after the component it is mixed into mounts.
     * This will ensure this.shape is defined. */

    this.sourceShape = this.graph.getElements().find(element => {
      return element.component && element.component.node.definition === this.node.definition.get('sourceRef');
    });

    this.setSource(this.sourceShape);
    this.setupLinkTools();

    const targetRef = this.node.definition.get('targetRef');

    if (targetRef.id) {
      const targetShape = this.graph.getElements().find(element => {
        return element.component && element.component.node.definition === targetRef;
      });

      const sequenceFlowWaypoints = this.node.diagram.waypoint;
      const sourceAnchorPoint = this.node.diagram.waypoint[0];
      const targetAnchorPoint = sequenceFlowWaypoints[sequenceFlowWaypoints.length - 1];

      if (sequenceFlowWaypoints) {
        const sequenceVertices = sequenceFlowWaypoints
          .slice(1, sequenceFlowWaypoints.length - 1)
          .map(({x, y}) => ({ x, y }));

        this.shape.vertices(sequenceVertices);
      }

      this.setSource(this.sourceShape, sourceAnchorPoint);
      this.setTarget(targetShape, targetAnchorPoint);
      this.completeLink();
    } else {
      this.setTarget(targetRef);
      this.paper.setInteractivity(false);
      this.paper.el.addEventListener('mousemove', this.updateLinkTarget);

      this.$emit('set-cursor', 'not-allowed');

      if (this.isValidConnection) {
        this.shape.stopListening(this.paper, 'blank:pointerdown link:pointerdown element:pointerdown', this.removeLink);
      } else {
        this.shape.listenToOnce(this.paper, 'blank:pointerdown link:pointerdown element:pointerdown', this.removeLink);
      }
    }

    this.updateRouter();
  },
  beforeDestroy() {
    document.removeEventListener('mouseup', this.emitSave);
  },
  destroyed() {
    /* Modify source and target refs to remove incoming and outgoing properties pointing to this link */
    const { sourceRef, targetRef } = this.node.definition;
    if (sourceRef) {
      pull(sourceRef.get('outgoing'), this.node.definition);
    }

    /* If targetRef is defined, it could be a point or another element.
     * If targetRef has an id, that means it's an element and the reference to it
     * can be safely removed. */
    if (targetRef.id) {
      pull(targetRef.get('incoming'), this.node.definition);
    }

    this.updateWaypoints.cancel();
  },
};
