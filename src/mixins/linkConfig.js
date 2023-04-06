import { dia, linkTools } from 'jointjs';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import { invalidNodeColor, setShapeColor, validNodeColor } from '@/components/nodeColors';
import { getDefaultAnchorPoint } from '@/portsUtils';
import resetShapeColor from '@/components/resetShapeColor';

const endpoints = {
  source: 'source',
  target: 'target',
};

function isPoint(item) {
  return item.x && item.y;
}

export default {
  props: ['highlighted', 'paper'],
  data() {
    return {
      sourceShape: null,
      target: null,
      listeningToMouseup: false,
      vertices: null,
      anchorPointFunction: getDefaultAnchorPoint,
    };
  },
  watch: {
    target(target, previousTarget) {
      if (previousTarget && previousTarget !== target) {
        resetShapeColor(previousTarget);
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
          line: { stroke: '#5096db' },
          '.joint-highlight-stroke': { 'display': 'none' },
        });
        this.shapeView.showTools();
      } else {
        resetShapeColor(this.shape);
        this.shapeView.hideTools();
      }
    },
  },
  computed: {
    shapeView() {
      return this.shape.findView(this.paper);
    },
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
  },
  methods: {
    findSourceShape() {
      return this.graph.getElements().find(element => {
        return element.component && element.component.node.definition === this.node.definition.get('sourceRef');
      });
    },
    setEndpoint(shape, endpoint, connectionOffset) {
      if (isPoint(shape)) {
        return this.shape[endpoint](shape, {
          anchor: {
            name: 'modelCenter',
            args: { padding: 25 },
          },
          connectionPoint: { name: 'boundary' },
        });
      }

      const getConnectionPoint = () => {
        const { x, y } = shape.position();
        const { width, height } = shape.size();
        return connectionOffset
          ? { x: x + connectionOffset.x, y: y + connectionOffset.y }
          : { x: x + (width / 2), y: y + (height / 2) };
      };

      this.shape[endpoint](shape, {
        anchor: () => {
          return this.getAnchorPointFunction(endpoint)(getConnectionPoint(), shape.findView(this.paper));
        },
        connectionPoint: { name: 'boundary' },
      });
    },
    setSource(sourceShape, connectionPoint) {
      this.setEndpoint(sourceShape, endpoints.source, connectionPoint);
    },
    setTarget(targetShape, connectionPoint) {
      this.setEndpoint(targetShape, endpoints.target, connectionPoint);
    },
    completeLink() {
      this.shape.stopListening(this.paper, 'cell:mouseleave');
      this.$emit('set-cursor', null);

      this.resetPaper();

      const targetShape = this.shape.getTargetElement();
      resetShapeColor(targetShape);

      this.shape.listenTo(this.sourceShape, 'change:position', this.updateWaypoints);
      this.shape.listenTo(targetShape, 'change:position', this.updateWaypoints);
      this.shape.on('change:vertices change:source change:target', this.updateWaypoints);

      const sourceShape = this.shape.getSourceElement();
      sourceShape.embed(this.shape);
      this.$emit('set-shape-stacking', sourceShape);
    },
    updateWaypoints() {
      const linkView = this.shape.findView(this.paper);
      const start = linkView.sourceAnchor;
      const end = linkView.targetAnchor;

      this.node.diagram.waypoint = [start,
        ...this.shape.vertices(),
        end].map(point => this.moddle.create('dc:Point', point));

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
          setShapeColor(this.target, invalidNodeColor);
        }

        return;
      }

      this.setTarget(this.target);
      this.updateRouter();
      this.$emit('set-cursor', 'default');
      setShapeColor(this.target, validNodeColor);

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
        resetShapeColor(this.target);
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
        resetShapeColor(this.target);
      }
    },
    getAnchorPointFunction(endpoint) {
      if (endpoint === 'source') {
        return this.sourceShape.component.anchorPointFunction || this.anchorPointFunction;
      }

      if (endpoint === 'target') {
        return this.target.component.anchorPointFunction || this.anchorPointFunction;
      }
    },
    setupLinkTools() {
      const verticesTool = new linkTools.Vertices();

      const sourceAnchorTool = new linkTools.SourceAnchor({ snap: this.getAnchorPointFunction('source') });
      const targetAnchorTool = new linkTools.TargetAnchor({ snap: this.getAnchorPointFunction('target') });
      const toolsView = new dia.ToolsView({
        tools: [verticesTool, sourceAnchorTool, targetAnchorTool],
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

    this.sourceShape = this.findSourceShape();

    this.setSource(this.sourceShape);

    this.$once('click', () => {
      this.$nextTick(() => {
        this.setupLinkTools();
      });
    });

    const targetRef = this.getTargetRef
      ? this.getTargetRef()
      : this.node.definition.get('targetRef');

    if (targetRef.id) {
      const targetShape = this.graph.getElements().find(element => {
        return element.component && element.component.node.definition === targetRef;
      });

      this.target = targetShape;

      const sequenceFlowWaypoints = this.node.diagram.waypoint;
      const sourceAnchorPoint = this.node.diagram.waypoint[0];
      const targetAnchorPoint = sequenceFlowWaypoints[sequenceFlowWaypoints.length - 1];

      const { x: targetX, y: targetY } = targetShape.position();
      const targetAnchorOffset = {
        x: targetAnchorPoint.x - targetX,
        y: targetAnchorPoint.y - targetY,
      };

      const { x: sourceX, y: sourceY } = this.sourceShape.position();
      const sourceAnchorOffset = {
        x: sourceAnchorPoint.x - sourceX,
        y: sourceAnchorPoint.y - sourceY,
      };

      if (sequenceFlowWaypoints) {
        const sequenceVertices = sequenceFlowWaypoints
          .slice(1, sequenceFlowWaypoints.length - 1)
          .map(({ x, y }) => ({ x, y }));

        this.shape.vertices(sequenceVertices);
      }

      this.setSource(this.sourceShape, sourceAnchorOffset);
      this.setTarget(targetShape, targetAnchorOffset);
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
    this.shape.on('change:vertices', function() {
      this.component.$emit('shape-resize');
    });
  },
  beforeDestroy() {
    document.removeEventListener('mouseup', this.emitSave);
  },
  destroyed() {
    this.updateWaypoints.cancel();
  },
};
