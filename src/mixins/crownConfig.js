import joint from 'jointjs';
import trashIcon from '@/assets/trash-alt-solid.svg';
import debounce from 'lodash/debounce';
import store, { saveDebounce, debounceOffset } from '@/store';
import pull from 'lodash/pull';

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
      handler({ x, y, width, height, direction }) {
        const { x: shapeX, y: shapeY } = this.shape.position();
        const { width: shapeWidth, height: shapeHeight } = this.shape.get('size');

        const sizeChanged = direction && (width !== shapeWidth || height !== shapeHeight);
        const positionChanged = x !== shapeX || y !== shapeY;

        if (!sizeChanged && !positionChanged) {
          return;
        }

        /* Temporarily disable the event listener so it doesn't record a new history for undo/redo */
        this.shape.off('change:position', this.updateNodePosition);
        this.shape.off('change:size', this.updateNodeSize);
        if (this.isPool) {
          this.shape.off('change:position change:size', this.startBatch);
          this.shape.off('change:position change:size', this.commitBatch);
        }

        if (sizeChanged) {
          sizeChanged && this.shape.resize(width, height, { direction });
        } else if (positionChanged) {
          this.shape.position(x, y);
        }

        this.updateCrownPosition();

        this.shape.on('change:position', this.updateNodePosition);
        this.shape.on('change:size', this.updateNodeSize);
        if (this.isPool) {
          this.shape.on('change:position change:size', this.startBatch);
          this.shape.on('change:position change:size', this.commitBatch);
        }
      },
      deep: true,
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
  },
  methods: {
    removeShape() {
      if (this.isPool || this.isLane) {
        store.commit('startBatchAction');
      }

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
    updateNodePosition(element, newPosition) {
      const { x, y } = this.node.diagram.bounds;
      if (x === Math.round(newPosition.x) && y === Math.round(newPosition.y)) {
        return;
      }

      store.dispatch('updateNodeBounds', { node: this.node, bounds: newPosition });
    },
    updateNodeSize(element, newSize, opt) {
      const { width, height } = this.node.diagram.bounds;
      if (width === newSize.width && height === newSize.height) {
        return;
      }

      /* Set direction on bounds to ensure it resizes in the correct direction during undo/redo */
      store.dispatch('updateNodeBounds', { node: this.node, bounds: { ...newSize, direction: opt.direction } });
    },
    startBatch() {
      store.commit('startBatchAction');
    },
    commitBatch() {
      this.startBatch.flush();
      this.updateNodePosition.flush();
      this.updateNodeSize.flush();
      store.commit('commitBatchAction');
    },
  },
  created() {
    this.updateNodePosition = debounce(this.updateNodePosition, saveDebounce);
    this.updateNodeSize = debounce(this.updateNodeSize, saveDebounce);
    this.startBatch = debounce(this.startBatch, saveDebounce - debounceOffset);
    this.commitBatch = debounce(this.commitBatch, saveDebounce + debounceOffset);
  },
  mounted() {
    this.$nextTick(() => {
      /* Use nextTick to ensure this code runs after the component it is mixed into mounts.
       * This will ensure this.shape is defined. */
      this.configureCrown();
      this.configurePoolLane();

      if (this.isPool) {
        /* Changes to pools always triggers batch actions. Because of this, ensure batch
         * changs are enabled just before node update, and commited just after, using
         * debounceOffset as the buffer. */
        this.shape.on('change:position change:size', this.startBatch);
        this.shape.on('change:position change:size', this.commitBatch);
      }

      this.shape.on('change:position', this.updateNodePosition);
      this.shape.on('change:size', this.updateNodeSize);
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

    pull(this.processNode.definition.get('flowElements'), this.node.definition);
    pull(this.planeElements, this.node.diagram);
    pull(this.processNode.definition.get('artifacts'), this.node.definition);

    if (this.isPool || this.isLane) {
      this.startBatch.flush();
      store.commit('commitBatchAction');
    }
  },
};
