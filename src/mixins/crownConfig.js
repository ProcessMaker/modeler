import { shapes } from 'jointjs';
import trashIcon from '@/assets/trash-alt-solid.svg';
import messageFlowIcon from '@/assets/message-flow.svg';
import { direction } from '@/components/nodes/association/associationConfig';
import pull from 'lodash/pull';

export const highlightPadding = 3;

const validMessageFlowSources = [
  'processmaker-modeler-start-event',
  'processmaker-modeler-end-event',
  'processmaker-modeler-task',
  'processmaker-modeler-pool',
  'processmaker-modeler-intermediate-message-catch-event',
];

const errorHighlighter = {
  name: 'stroke',
  options: {
    padding: 12,
    attrs: {
      stroke: 'red',
      'stroke-width': 3,
      opacity: 0.6,
    },
  },
};

const defaultHighlighter = {
  name: 'stroke',
  options: {
    attrs: {
      stroke: '#feb663',
      'stroke-width': 3,
    },
  },
};

export default {
  props: [
    'highlighted',
    'paper',
    'processNode',
    'planeElements',
    'moddle',
    'hasError',
    'collaboration',
    'nodeRegistry',
    'isRendering',
  ],
  data() {
    return {
      buttons: [],
      /* allowSetNodePosition is used to prevent setting a node position outside of a pool */
      allowSetNodePosition: true,
      savePositionOnPointerupEventSet: false,
      shape: null,
    };
  },
  watch: {
    highlighted() {
      this.setHighlight();
    },
    hasError() {
      if (this.isRendering) {
        return;
      }

      this.setErrorHighlight();
    },
  },
  computed: {
    shapeView() {
      return this.shape.findView(this.paper);
    },
    shapeBody() {
      return this.shapeView.$el.find('[joint-selector=body]');
    },
    isPool() {
      return this.node.type === 'processmaker-modeler-pool';
    },
    isLane() {
      return this.node.type === 'processmaker-modeler-lane';
    },
    isValidMessageFlowSource() {
      return validMessageFlowSources.includes(this.node.type);
    },
  },
  methods: {
    setHighlight() {
      if (this.highlighted) {
        this.shapeView.highlight(this.shapeBody, {highlighter: defaultHighlighter});
        this.addCrown();
        return;
      }

      this.shapeView.unhighlight(this.shapeBody, {highlighter: defaultHighlighter});
      this.removeCrown();
    },
    setErrorHighlight() {
      if (!this.shapeView) {
        return;
      }

      if (this.hasError) {
        this.shapeView.highlight(null, { highlighter: errorHighlighter });
      } else {
        this.shapeView.unhighlight(null, { highlighter: errorHighlighter });
      }
    },
    removeShape() {
      this.graph.getConnectedLinks(this.shape).forEach(shape => this.$emit('remove-node', shape.component.node));
      this.shape.getEmbeddedCells({deep: true}).forEach(cell => {
        if (cell.component) {
          this.graph.getConnectedLinks(cell).forEach(shape => this.$emit('remove-node', shape.component.node));
          this.shape.unembed(cell);
          this.$emit('remove-node', cell.component.node);
        }
      });

      this.$emit('remove-node', this.node);
    },
    removeCrown() {
      this.buttons.forEach(button => {
        button.attr('root/display', 'none');
      });
    },
    addCrown() {
      this.updateCrownPosition();

      this.buttons.forEach(button => {
        button.attr('root/display', 'initial');
      });
    },
    addSequence(cellView, evt, x, y) {
      this.removeCrown();
      const sequenceFlowConfig = this.nodeRegistry['processmaker-modeler-sequence-flow'];
      const sequenceLink = sequenceFlowConfig.definition(this.moddle, this.$t);
      sequenceLink.set('sourceRef', this.node.definition);
      sequenceLink.set('targetRef', { x, y });

      if (
        sequenceLink.sourceRef.$type === 'bpmn:ExclusiveGateway' ||
        sequenceLink.sourceRef.$type === 'bpmn:InclusiveGateway')
      {
        sequenceLink.conditionExpression = this.moddle.create('bpmn:FormalExpression', {
          body: '',
        });
      }

      this.$emit('add-node', {
        type: 'processmaker-modeler-sequence-flow',
        definition: sequenceLink,
        diagram: sequenceFlowConfig.diagram(this.moddle),
      });
    },
    addAssociation(cellView, evt, x, y) {
      this.removeCrown();
      const associationLink = this.moddle.create('bpmn:Association', {
        sourceRef: this.shape.component.node.definition,
        targetRef: { x, y },
        associationDirection: direction.none,
      });

      this.$emit('add-node', {
        type: 'processmaker-modeler-association',
        definition: associationLink,
        diagram: this.moddle.create('bpmndi:BPMNEdge'),
      });
    },
    addMessageFlow(cellView, evt, x, y) {
      this.removeCrown();

      const messageFlowDefinition = this.moddle.create('bpmn:MessageFlow', {
        name: '',
        sourceRef: this.shape.component.node.definition,
        targetRef: { x, y },
      });

      this.$emit('add-node', {
        type: 'processmaker-modeler-message-flow',
        definition: messageFlowDefinition,
        diagram: this.moddle.create('bpmndi:BPMNEdge'),
      });
    },
    addMessageFlowButton() {
      this.crownConfig.push({
        id: 'message-flow-button',
        title: this.$t('Message Flow'),
        icon: messageFlowIcon,
        clickHandler: this.addMessageFlow,
      });
    },
    configureCrown() {
      if (!this.crownConfig) {
        this.crownConfig = [];
      }

      if (this.isValidMessageFlowSource) {
        this.addMessageFlowButton();
      }

      this.crownConfig.push({
        id: 'delete-button',
        title: this.$t('Delete'),
        icon: trashIcon,
        clickHandler: this.removeShape,
      });

      this.crownConfig.forEach(({ id, title, icon, clickHandler }) => {
        const button = new shapes.standard.EmbeddedImage();
        this.buttons.push(button);

        button.set('onClick', clickHandler);
        button.set('elementMove', false);
        button.attr({
          root: {
            display: 'none',
            'data-test': id,
            'data-title': title || '',
          },
          body: {
            fill: 'none',
            stroke: 'none',
            opacity: 0.8,
            cursor: 'pointer',
          },
          image: {
            xlinkHref: icon,
            cursor: 'pointer',
            refWidth: 1,
            refHeight: 1,
            resetOffset: true,
          },
        });

        this.shape.embed(button);
      });

      this.paper.once('render:done', () => this.setHighlight());
      this.graph.addCells(this.buttons);

      this.shape.listenTo(this.paper, 'cell:mouseenter', cellView => {
        if (this.buttons.includes(cellView.model)) {
          this.$emit('setTooltip', cellView);
          cellView.model.attr({ body: { fill: '#fffbb4', stroke: '#fffbb4' } });
          this.shape.listenTo(this.paper, 'cell:mouseleave', () => {
            cellView.model.attr({ body: { fill: 'none', stroke: 'none' } });
          });
        }
      });

      const shapeView = this.shape.findView(this.paper);

      this.shape.on('change:size', () => {
        if (this.highlighted) {
          /* Ensure the highlight box expands to fit element */
          shapeView.unhighlight(this.shapeBody, { highlighter: defaultHighlighter });
          shapeView.highlight(this.shapeBody, { highlighter: defaultHighlighter });
        }
      });
    },
    updateCrownPosition() {
      const buttonLength = 25;
      const buttonMargin = 10;
      const { sx, sy } = this.paper.scale();
      const { x, y, width } = this.shape.findView(this.paper).getBBox();
      const { tx, ty } = this.paper.translate();

      this.buttons.forEach((button, index) => {
        const yOffset = ((buttonLength + buttonMargin) * index) * sy;

        button.resize(buttonLength, buttonLength);
        button.position((x + width + buttonMargin - tx) / sx, (y + yOffset - ty) / sy);
      });
    },
    configurePoolLane() {
      if ([
        'processmaker-modeler-pool',
        'processmaker-modeler-sequence-flow',
        'processmaker-modeler-association',
        'processmaker-modeler-message-flow',
      ].includes(this.node.type))
      {
        return;
      }

      if (this.node.pool) {
        if (!this.graph.getCell(this.node.pool)) {
          this.node.pool = this.graph.getElements().find(element => {
            return element.component && element.component.node === this.node.pool.component.node;
          });
        }

        this.node.pool.component.addToPool(this.shape);

        if (this.isLane) {
          this.configureLaneInParentPool();
        }

        return;
      }

      /* If we are over a pool or lane, add the shape to the pool or lane */
      const pool = this.graph.findModelsInArea(this.shape.getBBox()).filter(model => {
        return model.component && model.component.node.type === 'processmaker-modeler-pool';
      })[0];

      if (pool) {
        this.node.pool = pool;
        this.node.pool.component.addToPool(this.shape);

        if (this.isLane) {
          this.configureLaneInParentPool();
        }
      }
    },
    setNodePosition() {
      this.shape.stopListening(this.paper, 'element:pointerup', this.setNodePosition);
      this.savePositionOnPointerupEventSet = false;

      if (!this.allowSetNodePosition) {
        return;
      }

      this.$emit('save-state');
    },
    setUpCrownConfig() {
      this.configureCrown();

      this.shape.on('change:position', (element, newPosition) => {
        this.node.diagram.bounds.x = newPosition.x;
        this.node.diagram.bounds.y = newPosition.y;

        if (!this.savePositionOnPointerupEventSet) {
          this.shape.listenToOnce(this.paper, 'element:pointerup', this.setNodePosition);
          this.savePositionOnPointerupEventSet = true;
        }
      });

      if (!this.planeElements.includes(this.node.diagram)) {
        this.planeElements.push(this.node.diagram);
      }

      const process = this.node.pool
        ? this.node.pool.component.containingProcess
        : this.processNode.definition;
      const nodeTypes = Object.keys(this.node.definition.$descriptor.allTypesByName);

      if (nodeTypes.includes('bpmn:FlowElement') && !process.get('flowElements').includes(this.node.definition)) {
        process.get('flowElements').push(this.node.definition);
      }

      if (nodeTypes.includes('bpmn:Artifact') && !process.get('artifacts').includes(this.node.definition)) {
        process.get('artifacts').push(this.node.definition);
      }

      if (
        this.collaboration &&
        nodeTypes.includes('bpmn:MessageFlow') &&
        !this.collaboration.get('messageFlows').includes(this.node.definition)
      ) {
        this.collaboration.get('messageFlows').push(this.node.definition);
      }

      this.setErrorHighlight();
    },
  },
  mounted() {
    this.$nextTick(() => {
      /* Use nextTick to ensure this code runs after the component it is mixed into mounts.
       * This will ensure this.shape is defined. */

      this.configurePoolLane();

      if (this.isRendering) {
        this.paper.once('render:done', this.setUpCrownConfig);
      } else {
        this.setUpCrownConfig();
      }
    });
  },
  created() {
    this.$t = this.$t.bind(this);
  },
  destroyed() {
    this.shape.stopListening();
    this.shape.remove();

    const process = this.node.pool
      ? this.node.pool.component.containingProcess
      : this.processNode.definition;

    pull(process.get('flowElements'), this.node.definition);
    pull(this.planeElements, this.node.diagram);
    pull(process.get('artifacts'), this.node.definition);

    if (this.collaboration) {
      pull(this.collaboration.get('messageFlows'), this.node.definition);
    }
  },
};
