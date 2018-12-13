import joint from 'jointjs';
import resizeIcon from '@/assets/highlight-shape.svg';
import { minPoolHeight, minPoolWidth, labelWidth, poolPadding } from '@/components/nodes/pool/poolSizes';
import get from 'lodash/get';

export default {
  props: ['highlighted', 'paper', 'processNode', 'planeElements', 'moddle'],
  data() {
    return {
      anchorPoints: [],
      isResizing: true,
      elementPadding: 5,
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
  computed:{
    poolComponent() {
      return get(this, 'node.pool.component', this);
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
            this.updateAnchorPointPosition();
            point.off('change:position', this.resizeElement);
            this.shape.on('change:size', this.updateAnchorPointPosition);
          });
        }
      });

    },
    getYLimit() {
      const lowestShapeY = this.poolComponent.shape.getEmbeddedCells().filter(element => {
        return element.component;
      }).reduce((highestY, element) => {
        const { y, height } = element.findView(this.paper).getBBox();
        const elementY = element.component.node.type === 'processmaker-modeler-lane'
          ? y + minPoolHeight
          : y + height + poolPadding;

        return Math.max(elementY, highestY);
      },0);

      return lowestShapeY;
    },
    getXLimit() {
      const lowestShapeX = this.poolComponent.shape.getEmbeddedCells().filter(element => {
        return element.component;
      }).reduce((highestY, element) => {
        const { x, width } = element.findView(this.paper).getBBox();
        const elementX = element.component.node.type === 'processmaker-modeler-lane'
          ? x + minPoolWidth
          : x + width + poolPadding;

        return Math.max(elementX, highestY);
      },0);

      return lowestShapeX;
    },
    resizeElement(point, newPosition) {
      const { x, y } = newPosition;
      const { x: poolX, y: poolY } = this.poolComponent.shape.getBBox();

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) {
        return;
      }
      const laneShape = this.node.type === 'processmaker-modeler-lane';
      const maxPoolWidth = Math.max(x - poolX, this.getXLimit() - poolX, minPoolWidth);
      const maxPoolHeight = Math.max(y - poolY, this.getYLimit() - poolY, minPoolHeight);

      if (!laneShape) {
        this.shape.resize(maxPoolWidth , maxPoolHeight);
        point.position(maxPoolWidth, maxPoolHeight, ({ parentRelative: true }));
        point.set('previousPosition', { x, y });

        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      } else {
        if (this.shape === this.poolComponent.sortedLanes[this.poolComponent.sortedLanes.length -1]) {
          const { x, y } = this.shape.getBBox();
          this.poolComponent.shape.resize(maxPoolWidth , maxPoolHeight);
          point.position(maxPoolWidth + poolX, maxPoolHeight + poolY);
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
        }
      }

      // this.graph.getElements().filter(element => element.component).filter(element => element.component.node.type === 'processmaker-modeler-pool').forEach(pool =>{
      //   const { width, height, x ,y  } = this.shape.getBBox(); // this.shape === lane
      //   const { width: poolWidth , height: poolHeight, x: poolX, y: poolY } = pool.getBBox();

      //   this.graph.getElements().filter(element => element.component).filter(element => element.component.node.type === 'processmaker-modeler-lane').forEach(lane => {
      //     lane.resize(width, height);
      //     pool.resize(width + labelWidth, poolHeight );
      //   });
      // });


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
      const { x, y, width, height } = this.shape.findView(this.paper).getBBox();

      this.anchorPoints.forEach( point => {
        point.position(x + width, y + height);
      });
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
