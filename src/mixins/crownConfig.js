import joint from 'jointjs';
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
];

export default {
  props: ['highlighted', 'paper', 'processNode', 'planeElements', 'moddle', 'collaboration'],
  data() {
    return {
      buttons: [],
      allowSetNodePosition: true,
    };
  },
  watch: {
    highlighted(highlighted) {
      if (highlighted) {
        this.shapeView.highlight();
        this.addCrown();
      } else {
        this.shapeView.unhighlight();
        this.removeCrown();
      }
    },
  },
  computed: {
    shapeView() {
      return this.shape.findView(this.paper);
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
    removeShape() {
      this.graph.getConnectedLinks(this.shape).forEach(shape => this.$emit('remove-node', shape.component.node));
      this.shape.getEmbeddedCells().forEach(cell => {
        if (cell.component) {
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
      const sequenceLink = this.moddle.create('bpmn:SequenceFlow', {
        sourceRef: this.node.definition,
        targetRef: { x, y },
      });

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
        diagram: this.moddle.create('bpmndi:BPMNEdge'),
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
        icon: trashIcon,
        clickHandler: this.removeShape,
      });

      this.crownConfig.forEach(({ id, icon, clickHandler }) => {
        const button = new joint.shapes.standard.EmbeddedImage();
        this.buttons.push(button);

        button.set('onClick', clickHandler);
        button.set('elementMove', false);
        button.attr({
          root: { display: 'none', 'data-test': id },
          body: {
            fill: '#fff',
            stroke: ' #fff',
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
        button.addTo(this.graph);
      });

      this.shape.listenTo(this.paper, 'cell:mouseenter', cellView => {
        if (this.buttons.includes(cellView.model)) {
          cellView.model.attr({ body: { fill: '#fffbb4', stroke: '#fffbb4' } });
          this.shape.listenTo(this.paper, 'cell:mouseleave', () => {
            cellView.model.attr({ body: { fill: '#fff', stroke: '#fff' } });
          });
        }
      });

      const shapeView = this.shape.findView(this.paper);

      this.shape.on('change:size', () => {
        if (this.highlighted) {
          /* Ensure the highlight box expands to fit element */
          shapeView.unhighlight();
          shapeView.highlight();
        }
      });

      this.shape.on('change:position', (element, newPosition) => {
        this.node.diagram.bounds.x = newPosition.x;
        this.node.diagram.bounds.y = newPosition.y;
      });
    },
    updateCrownPosition() {
      const buttonLength = 25;
      const buttonMargin = 10;
      const { x, y, width, height } = this.shape.findView(this.paper).getBBox();
      const { tx, ty } = this.paper.translate();
      const crownHeight = (buttonLength * this.buttons.length) + (buttonMargin * (this.buttons.length - 1));
      const centerY = 0 - (crownHeight / 2) + (height / 2);

      this.buttons.forEach((button, index) => {
        const yOffset = (buttonLength + buttonMargin) * index;

        button.resize(buttonLength, buttonLength);
        button.position(x + width + buttonMargin - tx, y + yOffset + centerY - ty);
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

        return;
      }

      /* If we are over a pool or lane, add the shape to the pool or lane */
      const pool = this.graph.findModelsInArea(this.shape.getBBox()).filter(model => {
        return model.component && model.component.node.type === 'processmaker-modeler-pool';
      })[0];

      if (pool) {
        this.node.pool = pool;
        this.node.pool.component.addToPool(this.shape);
      }
    },
    setNodePosition() {
      const { x, y } = this.shape.getBBox();
      const { x: nodeX, y: nodeY } = this.node.diagram.bounds;

      if (!this.allowSetNodePosition || (x === nodeX && y === nodeY)) {
        return;
      }

      this.node.diagram.bounds.set('x', x);
      this.node.diagram.bounds.set('y', y);

      this.$emit('save-state');
    },
  },
  mounted() {
    this.$nextTick(() => {
      /* Use nextTick to ensure this code runs after the component it is mixed into mounts.
       * This will ensure this.shape is defined. */
      this.configureCrown();
      this.configurePoolLane();

      this.shape.listenTo(this.paper, 'element:pointerdown', cellView => {
        if (cellView.model === this.shape) {
          this.shape.listenToOnce(this.paper, 'element:pointerup', this.setNodePosition);
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

      if (nodeTypes.includes('bpmn:MessageFlow') && !this.collaboration.get('messageFlows').includes(this.node.definition)) {
        this.collaboration.get('messageFlows').push(this.node.definition);
      }
    });
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
  },
};
