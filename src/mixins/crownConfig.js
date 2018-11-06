import joint from 'jointjs';
import trashIcon from '@/assets/trash-alt-solid.svg';
import BpmnModdle from 'bpmn-moddle';
import { id as poolId } from '@/components/nodes/pool';

const moddle = new BpmnModdle();

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
      if (this.node.type !== poolId) {
        const flowElements = this.processNode.get('flowElements');
        flowElements.splice(flowElements.indexOf(this.node.definition), 1);
      }

      this.planeElements.splice(this.planeElements.indexOf(this.node.diagram), 1);

      this.shape.getEmbeddedCells().forEach(cell => {
        if (cell.component) {
          cell.component.removeShape();
        }
      });

      this.$delete(this.$parent.nodes, this.id);
    },
    removeCrown() {
      this.buttons.forEach((button) => {
        button.attr({
          root: { display: 'none' },
        });
      });
    },
    addCrown() {
      this.updateCrownPosition();

      this.buttons.forEach((button) => {
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

          this.shape.listenToOnce(this.paper, 'cell:mouseleave', () => {
            cellView.model.attr({ body: { fill: '#fff', stroke: '#fff' } });
          });
        }
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
        button.position(x + width + buttonMargin - tx, y + yOffset + centerY - ty)
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.configureCrown();

      /* If we are over a pool, add the shape to the pool */
      if (this.node.pool) {
        this.node.pool.component.addToPool(this.shape);
      }
    });
  },
  destroyed() {
    this.graph.getConnectedLinks(this.shape).forEach(shape => shape.component.removeShape());
    this.shape.stopListening();
    this.shape.remove();
  },
};
