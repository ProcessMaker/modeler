import { dia, linkTools } from 'jointjs';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import { invalidNodeColor, setShapeColor, validNodeColor } from '@/components/nodeColors';
import { getDefaultAnchorPoint } from '@/portsUtils';
import resetShapeColor from '@/components/resetShapeColor';
import store from '@/store';
import {
  removeOutgoingAndIncomingRefsToFlow,
} from '@/components/crown/utils';
import {
  COLOR_IDLE,
  COLOR_COMPLETED,
} from '@/components/highlightColors.js';

const endpoints = {
  source: 'source',
  target: 'target',
};

function isPoint(item) {
  return item.x && item.y;
}

export default {
  props: ['highlighted', 'paper', 'paperManager', 'isCompleted', 'isIdle'],
  data() {
    return {
      linkView: null,
      sourceShape: null,
      target: null,
      listeningToMouseup: false,
      listeningToMouseleave: false,
      vertices: null,
      anchorPointFunction: getDefaultAnchorPoint,
      onChangeWasFired: false,
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
      if (store.getters.isReadOnly) {
        return;
      }
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
    setHighlightColor(highlighted, color){
      if (highlighted) {
        this.shape.attr({
          line: { stroke: color },
          '.joint-highlight-stroke': { 'display': 'none' },
        });
        this.shapeView.showTools();
      } else {
        resetShapeColor(this.shape);
        this.shapeView.hideTools();
      }
    },
    setShapeHighlight() {
      if (this.isCompleted) {
        this.shape.attr({
          line: { stroke: COLOR_COMPLETED },
        });
      }
      else if (this.isIdle) {
        this.shape.attr({
          line: { stroke: COLOR_IDLE },
        });
      }
    },
    findSourceShape() {
      return this.graph.getElements().find(element => {
        return element.component && element.component.node.definition === this.node.definition.get('sourceRef');
      });
    },
    setEndpoint(shape, endpoint, connectionOffset) {
      if (shape && isPoint(shape)) {
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

      this.shape.on('change:vertices', this.onChangeVertices);
      this.shape.on('change:source', this.onChangeTargets);
      this.shape.on('change:target', this.onChangeTargets);
      this.shape.listenTo(this.sourceShape, 'change:position', this.updateWaypoints);
      this.shape.listenTo(targetShape, 'change:position', this.updateWaypoints);

      this.shape.listenTo(this.paper, 'link:mouseleave', this.storeWaypoints);
      // Listens to the 'pointerup' event when a link is interacted with on the shape.
      // When the event occurs, the 'pointerUpHandler' method is invoked to handle the pointer up action.
      this.shape.listenTo(this.paper, 'link:pointerup', this.pointerUpHandler);

      const sourceShape = this.shape.getSourceElement();
      sourceShape.embed(this.shape);
      this.$emit('set-shape-stacking', sourceShape);
    },
    waitForUpdateWaypoints() {
      return new Promise(resolve => {
        this.updateWaypoints();
        this.updateWaypoints.flush();
        resolve();
      });
    },
    async storeWaypoints() {
      if (this.highlighted && !this.listeningToMouseleave) {
        this.updateWaypoints();
        await this.$nextTick();

        if (this.$parent.isMultiplayer && this.linkView) {
          // update waypoints in multiplayer mode
          const nodeType = this.linkView.model.component.node.type;
          const sourceRefId = this.linkView.sourceView.model.component.node.definition.id;
          const targetRefId = this.linkView.targetView.model.component.node.definition.id;

          const changes = [
            {
              id: this.linkView.model.component.node.definition.id,
              properties: {
                type: nodeType,
                waypoint: [
                  this.linkView.sourceAnchor.toJSON(),
                  ...this.shape.vertices(),
                  this.linkView.targetAnchor.toJSON(),
                ],
                sourceRefId,
                targetRefId,
              },
            },
          ];

          window.ProcessMaker.EventBus.$emit('multiplayer-updateNodes', changes);
        }
        this.listeningToMouseleave = true;
        this.$emit('save-state');
      }
    },

    /**
     * Handles the pointer up event.
     * Performs actions based on changes in the target shape.
     * @async
     */
    async pointerUpHandler() {
      // Check if the 'onChange' event was fired. If not, exit the method.
      if (!this.onChangeWasFired) {
        return;
      }
      // Check if the target shape has changed.
      const targetChanged = this.target.id !== this.currentTarget.id;
      if (targetChanged) {
        // Disable the 'onChange' event to prevent redundant processing.
        this.onChangeWasFired = false;
        // Extract information about the new target shape
        const targetNode = get(this.currentTarget, 'component.node');
        const targetConfig = targetNode && this.nodeRegistry[targetNode.type];
        // Validate the flow with the new target node.
        const isValid = this.isValid?.({
          sourceShape: this.sourceShape,
          targetShape: this.currentTarget,
          targetConfig,
        });
        // If the flow is valid, update the target and related information.
        if (isValid) {
          removeOutgoingAndIncomingRefsToFlow(this.node);
          this.setTarget(this.currentTarget);
          this.target = this.currentTarget;
          // Optionally update definition links.
          if (this.updateDefinitionLinks) {
            this.updateDefinitionLinks();
          }
          this.listeningToMouseleave = true;
          // Store waypoints asynchronously.
          await this.storeWaypoints();
          const waypoint = [];
          this.node.diagram.waypoint?.forEach(point => {
            waypoint.push({
              x: point.x,
              y: point.y,
            });
          });
          window.ProcessMaker.EventBus.$emit('multiplayer-updateFlows', [
            {
              id: this.node.definition.id,
              type: this.node.type,
              name: this.node.definition.name,
              waypoint,
              sourceRefId: this.node.definition.sourceRef.id,
              targetRefId: this.node.definition.targetRef.id,
            },
          ]);
        } else {
          // If the flow is not valid, revert to the previous target.
          this.setTarget(this.target);
        }
      } else {
        // the target was not changed, set the target with the anchor offset.
        this.setTarget(this.target, this.getAnchorOffset());
      }
    },

    /**
     * Calculates the offset between the target anchor point and the position of the target element.
     *
     * @returns {Object} An object representing the offset with 'x' and 'y' properties.
     */
    getAnchorOffset() {
      // Get the waypoints of the sequence flow
      const sequenceFlowWaypoints = this.node.diagram.waypoint;
      // Get the last waypoint, which is the target anchor point
      const targetAnchorPoint = sequenceFlowWaypoints[sequenceFlowWaypoints.length - 1];
      // Get the position (x, y) of the target element
      const { x: targetX, y: targetY } = this.target.position();
      // Calculate and return the offset between the target anchor point and the target element position
      return {
        x: targetAnchorPoint.x - targetX,
        y: targetAnchorPoint.y - targetY,
      };
    },

    /**
     * Handles changes in target shapes for a link.
     * @async
     * @param {Link} link - The link whose target is being changed.
     * @param {Vertices} vertices - The new vertices information.
     * @param {Object} options - Additional options.
     */
    async onChangeTargets(link, vertices, options) {
      this.onChangeWasFired = true;
      if (options?.ui && vertices.id) {
        const newTarget = this.paper.getModelById(vertices.id);
        if (this.currentTarget.id !== newTarget.id) {
          // Change the target if it's different from the current target
          this.currentTarget = newTarget;
          this.listeningToMouseleave = true;
        } else {
          // If the target is the same, wait for the next update and store waypoints
          await this.$nextTick();
          await this.waitForUpdateWaypoints();
          this.listeningToMouseleave = false;
          await this.storeWaypoints();
        }
      }
    },
    async onChangeVertices(link, vertices, options){
      if (options?.ui) {
        this.updateWaypoints();
        await this.$nextTick();
        this.listeningToMouseleave = false;
        this.$emit('save-state');
      }
    },
    updateWaypoints() {
      this.linkView = this.shape.findView(this.paper);
      const start = this.linkView.sourceAnchor;
      const end = this.linkView.targetAnchor;

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

        if (this.linkView && ['processmaker-modeler-association', 'processmaker-modeler-data-input-association'].includes(this.shape.component.node.type)) {
          this.$parent.multiplayerHook(this.shape.component.node, false);
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
      let toolsView = new dia.ToolsView({
        tools: [verticesTool, sourceAnchorTool, targetAnchorTool],
      });
      if (this.shape.component.node.type === 'processmaker-modeler-sequence-flow') {
        toolsView = new dia.ToolsView({
          tools: [verticesTool, sourceAnchorTool, targetAnchorTool, new linkTools.TargetArrowhead()],
        });
      }
      this.currentTarget = this.shape.getTargetElement();
      this.shapeView.addTools(toolsView);
      this.shapeView.hideTools();
    },
    emitSave() {
      if (this.highlighted) {
        this.updateWaypoints.flush();
        document.removeEventListener('mouseup', this.emitSave);
        this.listeningToMouseup = false;
      }
    },
    /** 
     * This function creates a label for a stage.
     * @param {string} string - The text to display in the label.
     * @returns {Object} The label object.
     */
    stageLabel(string) {
      const label = {
        customType: 'stage',
        position: {
          distance: 0.5,
          offset: { x: 0, y: 0 }
        },
        attrs: {
          text: {
            text: string,
            fill: '#ffffff',
            fontWeight: 'bold',
            fontSize: 12
          },
          rect: {
            fill: '#788793',
            stroke: '#555555',
            strokeWidth: 1,
            rx: 3,
            ry: 3,
            ref: 'text',         // Relate rect to text
            refWidth: '250%',    // Expand width in relation to text
            refHeight: '100%',   // Expand height in relation to text
            refX: '-70%',        // Move rect slightly to the left (horizontal padding)
            refY: '0%'           // Move rect slightly upward (vertical padding)
          }
        }
      };
      return label;
    },
    /**
     * This function sets the stage label for a link.
     * @returns {void}
     */
    setStageLabel() {
      if(!(this.node.definition?.config)) {
        return;
      }
      const config = JSON.parse(this.node.definition.config);
      if(!(config?.stage?.id)) {
        return;
      }
      const label = this.stageLabel(config.stage.order);
      this.$nextTick(()=> {
        this.removeStageLabels();
        const linkView = this.shape.findView(this.paper);
        const labels = linkView.model.get('labels') || [];
        linkView.model.set('labels', [...labels, label]);
      });
    },
    /**
     * This function removes the stage labels for a link.
     * @returns {void}
     */
    removeStageLabels() {
      const linkView = this.shape.findView(this.paper);
      const labels = linkView.model.get('labels') || [];
      for (let i = labels.length - 1; i >= 0; i--) {
        if (labels[i].customType === 'stage') {
          linkView.model.removeLabel(i);
        }
      } 
    }
  },
  created() {
    this.updateWaypoints = debounce(this.updateWaypoints, 100);
    this.emitSave.bind(this);
    this.setStageLabel();
  },
  async mounted() {
    await this.$nextTick();
    /* Use nextTick to ensure this code runs after the component it is mixed into mounts.
     * This will ensure this.shape is defined. */

    this.sourceShape = this.findSourceShape();

    this.setSource(this.sourceShape);

    this.$once('click', () => {
      this.$nextTick(() => {
        if (store.getters.isReadOnly) {
          return;
        }
        this.setupLinkTools();
      });
    });

    const targetRef = this.getTargetRef
      ? this.getTargetRef()
      : this.node.definition.get('targetRef');

    // if flow doesn't have a targetRef such as incomplete node, return
    if (!targetRef) return;

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

    if (store.getters.isReadOnly) {
      this.$nextTick(() => {
        this.paperManager.awaitScheduledUpdates().then(() => {
          this.setShapeHighlight();
        });
      });
    }
  },
  beforeDestroy() {
    document.removeEventListener('mouseup', this.emitSave);
  },
  destroyed() {
    this.updateWaypoints.cancel();
  },
};
