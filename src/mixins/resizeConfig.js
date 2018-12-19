import joint from 'jointjs';
import resizeIcon from '@/assets/highlight-shape.svg';
import { minPoolHeight, minPoolWidth, poolPadding, labelWidth } from '@/components/nodes/pool/poolSizes';
import { minLaneWidth, minLaneHeight } from '@/components/nodes/poolLane/laneSizes';
import get from 'lodash/get';

export default {
  props: ['highlighted', 'paper', 'processNode', 'planeElements', 'moddle'],
  data() {
    return {
      anchorPoints: [],
      isResizing: true,
      elementPadding: 5,
      pointWidth: 15,
      pointHeight: 15,
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
      const pointBottomRight = new joint.shapes.standard.EmbeddedImage();
      const pointBottomLeft = new joint.shapes.standard.EmbeddedImage();
      const pointTopRight = new joint.shapes.standard.EmbeddedImage();
      const pointTopLeft = new joint.shapes.standard.EmbeddedImage();

      this.anchorPoints.push(
        pointBottomRight,
        pointBottomLeft,
        pointTopRight,
        pointTopLeft
      );

      pointBottomRight.set('isDrag', true);
      pointBottomLeft.set('isDrag', true);
      pointTopRight.set('isDrag', true);
      pointTopLeft.set('isDrag', true);

      this.pointAttributes(pointBottomRight, 'nwse-resize');
      this.pointAttributes(pointBottomLeft, 'nesw-resize');
      this.pointAttributes(pointTopRight, 'nesw-resize');
      this.pointAttributes(pointTopLeft, 'nwse-resize	');

      this.renderPointToGraph(pointBottomRight);
      this.renderPointToGraph(pointBottomLeft);
      this.renderPointToGraph(pointTopRight);
      this.renderPointToGraph(pointTopLeft);

      const { width, height } = this.shape.get('size');
      const { x, y } = this.shape.position();

      pointBottomRight.position(x + width, y + height);
      pointBottomRight.set('previousPosition', pointBottomRight.position());

      pointBottomLeft.position(x - this.pointWidth, y + height);
      pointBottomLeft.set('previousPosition', pointBottomLeft.position());

      pointTopRight.position(x + width, y - this.pointHeight);
      pointTopRight.set('previousPosition', pointTopRight.position());

      pointTopLeft.position(x - this.pointWidth, y - this.pointHeight);
      pointTopLeft.set('previousPosition', pointTopLeft.position());

      pointBottomRight.listenTo(this.paper, 'element:pointerdown', cellView => {
        /* Only listen to position change when dragging the point. */
        if (cellView.model === pointBottomRight) {
          pointBottomRight.on('change:position', this.resizeBottomRight);
        }
      });

      pointBottomLeft.listenTo(this.paper, 'element:pointerdown', cellView => {
        /* Only listen to position change when dragging the point. */
        if (cellView.model === pointBottomLeft) {
          pointBottomLeft.on('change:position', this.resizeBottomLeft);
        }
      });

      pointTopRight.listenTo(this.paper, 'element:pointerdown', cellView => {
        /* Only listen to position change when dragging the point. */
        if (cellView.model === pointTopRight) {
          pointTopRight.on('change:position', this.resizeTopRight);
        }
      });

      pointTopLeft.listenTo(this.paper, 'element:pointerdown', cellView => {
        /* Only listen to position change when dragging the point. */
        if (cellView.model === pointTopLeft) {
          pointTopLeft.on('change:position', this.resizeTopLeft);
        }
      });

      this.paper.on('element:pointerup', () => {
        pointBottomRight.off('change:position', this.resizeBottomRight);
        pointBottomLeft.off('change:position', this.resizeBottomLeft);
        pointTopRight.off('change:position', this.resizeTopRight);
        pointTopLeft.off('change:position', this.resizeTopLeft);
      });

      this.updateAnchorPointPosition();
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
    resizeTopLeft(point, newPosition, source) {
      const laneShape = this.node.type === 'processmaker-modeler-lane';
      const { x, y } = newPosition;
      const { x: poolX, y: poolY, width: poolWidth, height: poolHeight } = this.poolComponent.shape.getBBox();
      const { x: laneX, y: laneY, width: laneWidth, height: laneHeight } = this.shape.getBBox();
      const maxPoolWidth = Math.max((poolX + poolWidth) - (x + this.pointWidth),  minPoolWidth);
      const maxPoolHeight = Math.max((poolY + poolHeight) - (y + this.pointWidth), minPoolHeight);

      const maxLaneWidth = Math.max((laneX + laneWidth + labelWidth) - (x + this.pointWidth ), minLaneWidth);

      if (!source.ui) {
        return;
      }

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) {
        return;
      }

      if (!laneShape) {
        this.shape.resize(maxPoolWidth, maxPoolHeight, { direction: 'top-left' });
        point.set('previousPosition', { x, y });
        this.updateAnchorPointPosition();

        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      }
      else {
        if (this.shape === this.poolComponent.sortedLanes[0]) {
          this.poolComponent.shape.resize(maxLaneWidth, maxPoolHeight, { direction: 'top-left' });
          this.poolComponent.resizeLanes();
        }

        else if (this.shape === this.poolComponent.sortedLanes[this.poolComponent.sortedLanes.length - 1]) {
          const { x, y } = this.shape.getBBox();
          this.poolComponent.shape.resize(maxPoolWidth, maxPoolHeight);
          point.position(maxPoolWidth + poolX, maxPoolHeight + poolY);
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
        }
      }
      this.updateAnchorPointPosition();
      this.updateCrownPosition();
    },
    resizeTopRight(point, newPosition, source) {
      const laneShape = this.node.type === 'processmaker-modeler-lane';
      const { x, y } = newPosition;
      const { x: poolX, y: poolY, height: poolHeight } = this.poolComponent.shape.getBBox();
      const { x: laneX, y: laneY, height: laneHeight } = this.shape.getBBox();

      const maxPoolWidth = Math.max(x - poolX, this.getXLimit() - poolX, minPoolWidth);
      const maxPoolHeight = Math.max((poolY + poolHeight) - (y + this.pointWidth), minPoolHeight);

      const maxLaneWidth = x - laneX;
      const maxLaneHeight = laneHeight + (laneY - y - this.pointHeight);

      if (!source.ui) {
        return;
      }

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) {
        return;
      }

      if (!laneShape) {
        this.shape.resize(maxPoolWidth, maxPoolHeight, { direction: 'top-right' });
        point.set('previousPosition', { x, y });
        this.updateAnchorPointPosition();
        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      } else {
        if (this.shape === this.poolComponent.sortedLanes[0]) {
          this.poolComponent.shape.resize(maxPoolWidth, maxPoolHeight, { direction: 'top-right' });
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
          this.updateAnchorPointPosition(2);
        } else {
          this.shape.resize(maxLaneWidth, maxLaneHeight, { direction: 'top-right' });
          point.set('previousPosition', { x, y });
          this.poolComponent.fillLanes(this.shape, 'bottom-right');
          this.updateAnchorPointPosition([2]);
        }
      }

      this.updateCrownPosition();
    },
    resizeBottomLeft(point, newPosition, source) {
      const { x, y } = newPosition;
      const { x: poolX, y: poolY, width: poolWidth} = this.poolComponent.shape.getBBox();
      const { x: laneX, y: laneY, width: laneWidth } = this.shape.getBBox();

      const laneShape = this.node.type === 'processmaker-modeler-lane';

      const maxPoolWidth = Math.max((poolX + poolWidth) - (x + this.pointWidth),  minPoolWidth);
      const maxPoolHeight = Math.max(y - poolY, minPoolHeight);

      // const maxLaneWidth = Math.max(laneWidth + (laneX - (x + this.pointWidth)), this.getXLimit() - minLaneWidth);
      // const maxLaneHeight = Math.max(y - laneY, this.getYLimit() - minLaneHeight);
      const maxLaneWidth = laneWidth + (laneX - (x + this.pointWidth));
      const maxLaneHeight = y - laneY;

      if (!source.ui) {
        return;
      }

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) {
        return;
      }

      if (!laneShape) {
        this.shape.resize(maxPoolWidth, maxPoolHeight, { direction: 'bottom-left' });
        point.set('previousPosition', { x, y });
        this.updateAnchorPointPosition();
        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      } else {
        if (this.shape === this.poolComponent.sortedLanes[this.poolComponent.sortedLanes.length - 1]) {
          this.poolComponent.shape.resize(maxPoolWidth + labelWidth, maxPoolHeight, { direction: 'bottom-left' });
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
          this.updateAnchorPointPosition(1);
        } else {
          this.shape.resize(maxLaneWidth, maxLaneHeight, { direction: 'bottom-left' });
          point.set('previousPosition', { x, y });
          this.poolComponent.fillLanes(this.shape, 'top-left');
          this.updateAnchorPointPosition(1);
        }
      }

      this.updateCrownPosition();
    },
    resizeBottomRight(point, newPosition, source) {
      const { x, y } = newPosition;
      const { x: poolX, y: poolY } = this.poolComponent.shape.getBBox();
      const { x: laneX, y: laneY } = this.shape.getBBox();

      const laneShape = this.node.type === 'processmaker-modeler-lane';

      const maxPoolWidth = Math.max(x - poolX, this.getXLimit() - poolX, minPoolWidth);
      const maxPoolHeight = Math.max(y - poolY, this.getYLimit() - poolY, minPoolHeight);

      const maxLaneWidth = x - laneX;
      const maxLaneHeight = y - laneY;

      if (!source.ui) {
        return;
      }

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) {
        return;
      }

      if (!laneShape) {
        this.shape.resize(maxPoolWidth, maxPoolHeight, { direction: 'bottom-right' });
        point.set('previousPosition', { x, y });
        this.updateAnchorPointPosition();
        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      } else {
        if (this.shape === this.poolComponent.sortedLanes[this.poolComponent.sortedLanes.length - 1]) {
          this.poolComponent.shape.resize(maxPoolWidth, maxPoolHeight, { direction: 'bottom-right' });
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
          this.updateAnchorPointPosition(0);
        } else {
          this.shape.resize(maxLaneWidth, maxLaneHeight, { direction: 'bottom-right' });
          point.set('previousPosition', { x, y });
          this.poolComponent.fillLanes(this.shape, 'top-right');
          this.updateAnchorPointPosition(0);
        }
      }

      this.updateCrownPosition();
    },
    addResizeAnchors() {
      this.anchorPoints.forEach(button => {
        button.attr('root/display', 'initial');
      });

      this.updateAnchorPointPosition();
    },
    removeResizeAnchors() {
      this.anchorPoints.forEach(button => {
        button.attr('root/display', 'none');
      });
    },
    updateAnchorPointPosition(excludePoint) {
      const { x, y } = this.shape.position();
      const { width, height } = this.shape.get('size');

      excludePoint !== 0 && this.anchorPoints[0].position(x + width, y + height); // Bottom Right Point
      excludePoint !== 1 && this.anchorPoints[1].position(x - this.pointWidth, y + height); // Bottom Left Point
      excludePoint !== 2 && this.anchorPoints[2].position(x + width, y - this.pointHeight); // Top Right Point
      excludePoint !== 3 && this.anchorPoints[3].position(x - this.pointWidth, y - this.pointWidth); //Top Left Point
    },
    pointAttributes(point, cursorDirection) {
      point.attr({
        root: { display: 'none' },
        body: {
          fill: '#fff',
          stroke: ' #fff',
          opacity: 0.8,
          cursor: `${cursorDirection}`,
        },
        image: {
          xlinkHref: resizeIcon,
          cursor: `${cursorDirection}`,
          refWidth: 20,
          refHeight: 20,
          resetOffset: true,
        },
      });
    },
    renderPointToGraph(pointLocation) {
      this.shape.embed(pointLocation);
      pointLocation.addTo(this.graph);
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
