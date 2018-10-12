import joint from 'jointjs';
import trashIcon from '@/assets/trash-alt-solid.svg';
import BpmnModdle from 'bpmn-moddle'

let moddle = new BpmnModdle;

export default {
  props: ['highlighted', 'paper'],
  data() {
    return {
      buttons: [],
    }
  },
  watch: {
    highlighted(highlighted) {
      highlighted ? this.addCrown() : this.removeCrown();
    }
  },
  computed: {
    getEmbeddedCells() {
      return this.shape.getEmbeddedCells();
    }
  },
  methods: {
    removeCrown() {
      this.getEmbeddedCells.forEach((button) => {
        button.attr({
          image: { display: 'none', fill: '#fff' },
        });
      });
    },
    addCrown() {
      this.getEmbeddedCells.forEach((button) => {
        button.attr({
          image: { display: 'initial', fill: '#fff' },
        });
      });
    },
    addSequence(cellView, evt, x, y) {
      const sequenceLink = moddle.create('bpmn:SequenceFlow', {
        sourceRef: this.shape.component.node.definition,
        targetRef: { x, y },
      });

      this.$emit('add-node', {
        type: 'sequenceFlow',
        definition: sequenceLink,
        diagram: moddle.create('bpmndi:BPMNEdge'),
      });
    },
    configureCrown() {
      if (!this.crownConfig) {
        this.crownConfig = [];
      }

      this.crownConfig.push({
        icon: trashIcon,
        clickHandler: () => this.shape.remove(),
      });

      this.crownConfig.forEach(({ icon, clickHandler }) => {
        const button = new joint.shapes.standard.Image();
        this.buttons.push(button);

        button.set('onClick', clickHandler);
        button.attr({
          image: {
            xlinkHref: icon,
            cursor: 'pointer',
            display: 'none',
          },
        });

        this.shape.embed(button);
        button.addTo(this.graph);
        this.updateCrownPosition();
      });
    },
    updateCrownPosition() {
      const buttonLength = 25;
      const buttonMargin = 10;

      const { width } = this.shape.findView(this.paper).$el[0].getBBox();

      this.buttons.forEach((button, index) => {
        const yOffset = (buttonLength + buttonMargin) * index;

        button.resize(buttonLength, buttonLength);
        button.position(width + buttonMargin, yOffset, { parentRelative: true });
      });
    }
  },
  mounted() {
    this.$nextTick(this.configureCrown);
  },
};
