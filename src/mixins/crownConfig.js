import joint from 'jointjs';
import trashIcon from '@/assets/trash-alt-solid.svg';
import debounce from 'lodash/debounce';
import store, { saveDebounce } from '@/store';

export const highlightPadding = 3;

export default {
  props: ['highlighted', 'paper', 'processNode', 'planeElements', 'moddle'],
  data() {
    return {
      buttons: [],
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
    'node.diagram.bounds': {
      handler({ x, y }) {
        const { x: shapeX, y: shapeY } = this.shape.position();
        if (x === shapeX && y === shapeY) {
          return;
        }

        /* Temporarily disable the event listener so it doesn't record a new history for undo/redo */
        this.shape.off('change:position change:size', this.updateNodeBounds);

        this.shape.position(x, y);
        this.updateCrownPosition();

        this.shape.on('change:position change:size', this.updateNodeBounds);
      },
      deep: true,
    },
  },
  computed: {
    shapeView() {
      return this.shape.findView(this.paper);
    },
  },
  methods: {
    removeShape() {
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

      if (sequenceLink.sourceRef.$type === 'bpmn:ExclusiveGateway' || sequenceLink.sourceRef.$type === 'bpmn:InclusiveGateway') {
        sequenceLink.conditionExpression = this.moddle.create('bpmn:FormalExpression', {
          body: '',
        });
      }

      store.commit('useTemp');
      this.$emit('add-node', {
        type: 'processmaker-modeler-sequence-flow',
        definition: sequenceLink,
        diagram: this.moddle.create('bpmndi:BPMNEdge'),
      });
    },
    addAssociation(cellView, evt, x, y) {
      const associationLink = this.moddle.create('bpmn:Association', {
        sourceRef: this.shape.component.node.definition,
        targetRef: { x, y },
      });

      this.$emit('add-node', {
        type: 'processmaker-modeler-association',
        definition: associationLink,
        diagram: this.moddle.create('bpmndi:BPMNEdge'),
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
      if (['processmaker-modeler-pool', 'processmaker-modeler-sequence-flow', 'processmaker-modeler-association'].includes(this.node.type)) {
        return;
      }

      if (this.node.pool) {
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
    updateNodeBounds: debounce(function(element, newBounds) {
      const { x, y, width, height } = this.node.diagram.bounds;
      if (
        (x === newBounds.x && y === newBounds.y) ||
        (width === newBounds.width && height === newBounds.height)
      ) {
        return;
      }

      store.dispatch('updateNodeBounds', { node: this.node, bounds: newBounds });
    }, saveDebounce),
  },
  mounted() {
    this.$nextTick(() => {
      /* Use nextTick to ensure this code runs after the component it is mixed into mounts.
       * This will ensure this.shape is defined. */
      this.configureCrown();
      this.configurePoolLane();
      this.shape.on('change:position change:size', this.updateNodeBounds);
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
