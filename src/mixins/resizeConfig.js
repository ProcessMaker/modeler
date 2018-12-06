import joint from 'jointjs';
import resizeIcon from '@/assets/highlight-shape.svg';

export default {
  props: ['highlighted', 'paper', 'processNode', 'planeElements', 'moddle'],
  data() {
    return {
      anchorPoints: [],
    };
  },
  watch: {
    highlighted(highlighted) {
      if (highlighted) {
        this.addResizeAnchors();
      } else {
        this.removeResizeAnchors();
      }
    },
  },
  methods: {
    configureResize() {
      if (!this.resizeConfig) {
        this.resizeConfig = [];
      }

      const point = new joint.shapes.standard.EmbeddedImage();

      this.anchorPoints.push(point);

      point.set('isDrag', true);

      point.attr({
        root: { display: 'none' },
        body: {
          fill: '#fff',
          stroke: ' #fff',
          opacity: 0.8,
          cursor: 'nwse-resize',
        },
        image: {
          xlinkHref: resizeIcon,
          cursor: 'nwse-resize',
          refWidth: 20,
          refHeight: 20,
          resetOffset: true,
        },
      });

      this.shape.embed(point);
      point.addTo(this.graph);

      const { width, height } = this.shape.get('size');
      const { x, y } = this.shape.position();
      point.position(x + width, y + height);
      point.set('previousPosition', point.position());

      this.shape.on('change:size', this.updateAnchorPointPosition);

      point.listenTo(this.paper, 'element:pointerdown', cellView => {
        /* Only listen to position change when dragging the point. */
        if (cellView.model === point) {
          point.on('change:position', this.resizeElement);
          this.shape.off('change:size', this.updateAnchorPointPosition);

          point.listenToOnce(this.paper, 'element:pointerup', () => {
            point.off('change:position', this.resizeElement);
            this.shape.on('change:size', this.updateAnchorPointPosition);
          });
        }
      });
    },
    resizeElement(point, newPosition) {
      const { x, y } = newPosition;
      const { x: poolX, y: poolY } = this.shape.position();

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) {
        return;
      }

      this.shape.resize(Math.max(x - poolX, 300), Math.max(y - poolY, 60));
      if (x < 300 || y < 60) {
        point.position(Math.max(x, 300), Math.max(y, 60), {
          parentRelative: true,
        });
      }

      point.set('previousPosition', { x, y });

      if (this.laneSet) {
        this.resizeLanes();
      }

      this.updateCrownPosition();
    },
    addResizeAnchors() {
      this.anchorPoints.forEach(button => {
        button.attr('root/display', 'initial');
      });
    },
    removeResizeAnchors() {
      this.anchorPoints.forEach(button => {
        button.attr('root/display', 'none');
      });
    },
    updateAnchorPointPosition() {
      // this.anchorPoints.forEach((point, index) => {
      const { x, y, width, height } = this.shape.findView(this.paper).getBBox();
      const { tx, ty } = this.paper.translate();
      const crownHeight = (this.anchorPoints.length) + ((this.anchorPoints.length - 1));
      const centerY = 0 - (crownHeight) + (height);

      this.anchorPoints.forEach((point, index) => {
        const yOffset = index;

        point.position(x + width - tx, y + yOffset + centerY - ty);
      });
      // });
    },
  },
  mounted() {
    this.$nextTick(() => {
      /* Use nextTick to ensure this code runs after the component it is mixed into mounts.
       * This will ensure this.shape is defined. */
      this.configureResize();
    });
  },
};
