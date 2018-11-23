import joint from 'jointjs';
import trashIcon from '@/assets/trash-alt-solid.svg';
import BpmnModdle from 'bpmn-moddle';

const moddle = new BpmnModdle();

export const highlightPadding = 3;

export default {
  props: ['highlighted', 'paper', 'processNode', 'planeElements'],
  data() {
    return {
      buttons: [],
    };
  },
  watch: {
    highlighted(highlighted) {
      highlighted ? this.addCrown() : this.removeCrown();
    },
  },
  computed: {
    getEmbeddedCells() {
      return this.shape.getEmbeddedCells();
    },
  },
  methods: {
    removeShape() {
      this.$emit('remove-node', this.node);
    },
    removeCrown() {
      this.buttons.forEach(button => {
        button.attr({
          root: { display: 'none' },
        });
      });
    },
    addCrown() {
      this.updateCrownPosition();

      this.buttons.forEach(button => {
        button.attr({
          root: { display: 'initial' },
        });
      });
    },
    addSequence(cellView, evt, x, y) {
      const sequenceLink = moddle.create('bpmn:SequenceFlow', {
        sourceRef: this.shape.component.node.definition,
        targetRef: { x, y },
      });

      if (sequenceLink.sourceRef.$type === 'bpmn:ExclusiveGateway') {
        sequenceLink.conditionExpression = moddle.create('bpmn:FormalExpression', {
          body: '',
        });
      }

      this.$emit('add-node', {
        type: 'processmaker-modeler-sequence-flow',
        definition: sequenceLink,
        diagram: moddle.create('bpmndi:BPMNEdge'),
      });
    },
    addAssociation(cellView, evt, x, y) {
      const associationLink = moddle.create('bpmn:Association', {
        sourceRef: { x, y },
        targetRef: this.shape.component.node.definition,
      });

      this.$emit('add-node', {
        type: 'processmaker-modeler-association',
        definition: associationLink,
        diagram: moddle.create('bpmndi:BPMNEdge'),
      });
    },
    configureCrown() {
      if (!this.crownConfig) {
        this.crownConfig = [];
      }

      this.crownConfig.push({
        icon: trashIcon,
        clickHandler: this.removeShape,
      });

      this.crownConfig.forEach(({ icon, clickHandler }) => {
        const button = new joint.shapes.standard.EmbeddedImage();
        this.buttons.push(button);

        button.set('onClick', clickHandler);
        button.attr({
          root: { display: 'none' },
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
        this.updateCrownPosition();
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

      this.updateCrownPositionOnKeyDown();
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
    updateCrownPositionOnKeyDown() {
      document.addEventListener('keydown', () => {
        this.updateCrownPosition();
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      /* Use nextTick to ensure this code runs after the component it is mixed into mounts.
       * This will ensure this.shape is defined. */

      this.configureCrown();

      /* If we are over a pool or lane, add the shape to the pool or lane */
      if (!['processmaker-modeler-pool', 'processmaker-modeler-sequence-flow'].includes(this.node.type)) {
        const pool = this.graph.findModelsInArea(this.shape.getBBox()).filter(model => {
          return model.component && model.component.node.type === 'processmaker-modeler-pool';
        })[0];

        if (pool) {
          this.node.pool = pool;
          this.node.pool.component.addToPool(this.shape);
        }
      }
    });
  },
  beforeDestroy() {
    this.graph.getConnectedLinks(this.shape).forEach(shape => this.$emit('remove-node', shape.component.node));
    this.shape.getEmbeddedCells().forEach(cell => {
      if (cell.component) {
        this.shape.unembed(cell);
        this.$emit('remove-node', cell.component.node);
      }
    });
  },
  destroyed() {
    this.shape.stopListening();
    this.shape.remove();
  },
};
