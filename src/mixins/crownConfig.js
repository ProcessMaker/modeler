import joint from 'jointjs';
import trashIcon from '@/assets/trash-alt-solid.svg';

export default {
  props: ['highlighted', 'paper'],
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
          image: { display: 'none' },
        });
      });
    },
    addCrown() {
      this.getEmbeddedCells.forEach((button) => {
        button.attr({
          image: { display: 'initial' },
        });
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

      this.crownConfig.forEach(({ icon, clickHandler }, index) => {
        const button = new joint.shapes.standard.Image();
        const buttonLength = 25;
        const buttonMargin = 10;
        const yOffset = (buttonLength + buttonMargin) * index;

        button.set('onClick', clickHandler);
        button.disableInteractions = true;
        button.resize(buttonLength, buttonLength);
        button.attr({
          image: {
            xlinkHref: icon,
            cursor: 'pointer',
            display: 'none',
          },
        });

        this.shape.embed(button);
        button.addTo(this.graph);
        const { x, width } = this.shape.findView(this.paper).$el[0].getBBox();
        button.position(x + width + buttonMargin, yOffset, { parentRelative: true });
      });
    }
  },
  mounted() {
    this.$nextTick(this.configureCrown);
  }
};
