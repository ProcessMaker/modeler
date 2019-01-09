import joint from 'jointjs';
import resizeIcon from '@/assets/highlight-shape.svg';
import { minPoolHeight, minPoolWidth, poolPadding, labelWidth, labelHeight } from '@/components/nodes/pool/poolSizes';
import { minLaneWidth, minLaneHeight, minLanePoolHeight } from '@/components/nodes/poolLane/laneSizes';
import get from 'lodash/get';
import store from '@/store';
import { id as laneId } from '@/components/nodes/poolLane';

export default {
  props: ['highlighted', 'paper', 'processNode', 'planeElements', 'moddle'],
  data() {
    return {
      anchorPoints: [],
      isResizing: true,
      pointWidth: 15,
      pointHeight: 15,
      elementBounds: [],
      elementTopY: null,
      elementRightX: null,
      elementBottomY: null,
      elementLeftX: null,
    };
  },
  watch: {
    highlighted(highlighted) {
      if (this.anchorPoints.length === 0) {
        return;
      }

      if (highlighted) {
        this.addResizeAnchors();
        this.calculateElementLimits();
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
    calculateElementLimits() {
      console.log('calculateElementLimits');
      this.elementBounds = this.poolComponent.shape.getEmbeddedCells()
        .filter(element => element.component && element.component.node.type !== laneId)
        .map(element => element.getBBox());

      this.elementTopY = Math.min(...this.elementBounds.map(({ y }) => y - poolPadding));
      this.elementRightX = Math.max(...this.elementBounds.map(({ x, width }) => x + width + poolPadding));

      this.elementBottom = Math.min(...this.elementBounds.map(({ y, height }) => (y + height) - poolPadding));
      this.elementLeftX = Math.max(...this.elementBounds.map(({ x }) => x - poolPadding));
    },
    configureResize() {
      const pointBottomRight = new joint.shapes.standard.EmbeddedImage();
      const pointBottomLeft = new joint.shapes.standard.EmbeddedImage();
      const pointTopRight = new joint.shapes.standard.EmbeddedImage();
      const pointTopLeft = new joint.shapes.standard.EmbeddedImage();

      this.anchorPoints = [
        pointBottomRight,
        pointBottomLeft,
        pointTopRight,
        pointTopLeft,
      ];

      const { x, y, width, height } = this.shape.getBBox();

      this.anchorPoints.forEach(point => {
        point.set('isDrag', true);

        try {
          this.shape.embed(point);
        } catch (error) {
          /* There is an error when re-adding points after removing/re-adding the pool.
           * Ignore it for now. */
        }

        point.addTo(this.graph);
        point.set('previousPosition', point.position());
      });

      this.setPointAttributes(pointBottomRight, 'nwse-resize');
      this.setPointAttributes(pointBottomLeft, 'nesw-resize');
      this.setPointAttributes(pointTopRight, 'nesw-resize');
      this.setPointAttributes(pointTopLeft, 'nwse-resize');

      pointBottomRight.position(x + width, y + height);
      pointBottomLeft.position(x - this.pointWidth, y + height);
      pointTopRight.position(x + width, y - this.pointHeight);
      pointTopLeft.position(x - this.pointWidth, y - this.pointHeight);

      pointBottomRight.listenTo(this.paper, 'element:pointerdown', cellView => {
        /* Only listen to position change when dragging the point. */
        if (cellView.model === pointBottomRight) {
          pointBottomRight.on('change:position', this.resizeBottomRight);
          this.shape.listenToOnce(this.paper, 'element:pointerup', () => {
            pointBottomRight.off('change:position', this.resizeBottomRight);
            this.resizeUpdate();
          });
        }
      });

      pointBottomLeft.listenTo(this.paper, 'element:pointerdown', cellView => {
        /* Only listen to position change when dragging the point. */
        if (cellView.model === pointBottomLeft) {
          pointBottomLeft.on('change:position', this.resizeBottomLeft);
          this.shape.listenToOnce(this.paper, 'element:pointerup', () => {
            pointBottomLeft.off('change:position', this.resizeBottomLeft);
            this.resizeUpdate();
          });
        }
      });

      pointTopRight.listenTo(this.paper, 'element:pointerdown', cellView => {
        /* Only listen to position change when dragging the point. */
        if (cellView.model === pointTopRight) {
          pointTopRight.on('change:position', this.resizeTopRight);
          this.shape.listenToOnce(this.paper, 'element:pointerup', () => {
            pointTopRight.off('change:position', this.resizeTopRight);
            this.resizeUpdate();
          });
        }
      });

      pointTopLeft.listenTo(this.paper, 'element:pointerdown', cellView => {
        /* Only listen to position change when dragging the point. */
        if (cellView.model === pointTopLeft) {
          pointTopLeft.on('change:position', this.resizeTopLeft);
          this.shape.listenToOnce(this.paper, 'element:pointerup', () => {
            pointTopLeft.off('change:position', this.resizeTopLeft);
            this.resizeUpdate();
          });
        }
      });
    },
    resizeUpdate() {
      const { width, height } = this.node.diagram.bounds;
      const bbox = this.shape.getBBox();
      if (width !== bbox.width || height !== bbox.height) {
        if (this.node.type === laneId) {
          store.commit('startBatchAction');
          setTimeout(() => store.commit('commitBatchAction'));

          store.dispatch('updateNodeBounds', {
            node: this.poolComponent.node,
            bounds: this.poolComponent.shape.getBBox(),
          });

          this.poolComponent.sortedLanes().forEach(lane => {
            store.dispatch('updateNodeBounds', {
              node: lane.component.node,
              bounds: lane.component.shape.getBBox(),
            });
          });
        } else {
          store.dispatch('updateNodeBounds', {
            node: this.node,
            bounds: this.shape.getBBox(),
          });
        }
      }
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
      }, 0);

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
      }, 0);

      return lowestShapeX;
    },
    resizeTopLeft(point, newPosition, source) {
      const direction = 'top-left';
      const laneShape = this.node.type === 'processmaker-modeler-lane';
      const { x, y } = newPosition;
      const { x: poolX, y: poolY, width: poolWidth, height: poolHeight } = this.poolComponent.shape.getBBox();
      const { x: laneX, y: laneY, width: laneWidth, height: laneHeight } = this.shape.getBBox();

      const maxPoolWidth = Math.max((poolX + poolWidth) - (x + this.pointWidth), this.elementLeftX - (x + this.pointWidth), minPoolWidth);
      const maxPoolHeight = Math.max(
        (poolY + poolHeight) - (y + this.pointWidth),
        poolY + poolHeight - this.elementTopY,
        minPoolHeight
      );

      const maxLaneWidth = laneWidth + (laneX - (x + this.pointWidth));
      const maxLaneHeight = laneHeight + (laneY - y - this.pointHeight);

      if (!source.ui) {
        return;
      }

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) {
        return;
      }

      if (!laneShape) {
        this.shape.resize(maxPoolWidth - labelWidth, maxPoolHeight, { direction });
        point.set('previousPosition', { x, y });
        this.updateAnchorPointPosition();

        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      } else {
        if (this.shape === this.poolComponent.sortedLanes()[0]) {
          if (maxPoolHeight < minLanePoolHeight) {
            return;
          }
          this.poolComponent.shape.resize(maxPoolWidth, maxPoolHeight, { direction });
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
          this.updateAnchorPointPosition(3);
        } else {
          if (maxLaneHeight < minLaneHeight) {
            return;
          }
          this.shape.resize(maxLaneWidth, maxLaneHeight, { direction });
          point.set('previousPosition', { x, y });
          this.poolComponent.fillLanes(this.shape, direction);
          this.updateAnchorPointPosition(3);
        }
      }

      this.updateCrownPosition();
    },
    resizeTopRight(point, newPosition, source) {
      const direction = 'top-right';
      const { x, y } = newPosition;
      const { x: poolX, y: poolY, height: poolHeight} = this.poolComponent.shape.getBBox();
      const { x: laneX, y: laneY, height: laneHeight } = this.shape.getBBox();

      const maxPoolWidth = Math.max(x - poolX, this.elementRightX - poolX, minPoolWidth);
      const maxPoolHeight = Math.max(
        (poolY + poolHeight) - (y + this.pointWidth),
        poolY + poolHeight - this.elementTopY,
        minPoolHeight
      );

      const maxLaneWidth = x - laneX;
      const maxLaneHeight = laneHeight + (laneY - y - this.pointHeight);

      if (!source.ui) {
        return;
      }

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) {
        return;
      }

      if (this.isLane) {
        /* When resizing a lane, we only have to consider the lane's min size,
         * and the min size of the lane above (if any) */

        // TODO
        if (this.shape === this.poolComponent.sortedLanes()[0]) {
          if (maxPoolHeight < minLanePoolHeight) {
            return;
          }

          this.poolComponent.shape.resize(maxPoolWidth, maxPoolHeight, { direction });
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
          this.updateAnchorPointPosition(2);
        } else {
          if (maxLaneHeight < minLaneHeight) {
            return;
          }
          this.shape.resize(maxLaneWidth, maxLaneHeight, { direction });
          point.set('previousPosition', { x, y });
          this.poolComponent.fillLanes(this.shape, direction);
          this.updateAnchorPointPosition(2);
        }
      } else {
        /* When resizing a pool, we have to consider the pool's min size,
         * the min size of the top and bottom lanes (if any), and the
         * location of elements around the pools edge (if any) */

        this.shape.resize(maxPoolWidth, maxPoolHeight, { direction });
        point.set('previousPosition', { x, y });
        this.updateAnchorPointPosition();
        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      }

      this.updateCrownPosition();
    },
    resizeBottomLeft(point, newPosition, source) {
      const direction = 'bottom-left';
      const { x, y } = newPosition;
      const { x: poolX, y: poolY, width: poolWidth, height: poolHeight} = this.poolComponent.shape.getBBox();
      const { x: laneX, y: laneY, width: laneWidth } = this.shape.getBBox();

      const laneShape = this.node.type === 'processmaker-modeler-lane';

      const maxPoolWidth = Math.max((poolX + poolWidth) - ( x + this.pointWidth), this.getXLimit() + poolX,  minPoolWidth);
      const maxPoolHeight = Math.max(y - poolY, this.getYLimit() - poolY, minPoolHeight);

      const maxLaneWidth = Math.max(laneWidth + (laneX - (x + this.pointWidth)), this.getXLimit() + laneX, minLaneWidth);
      const maxLaneHeight = Math.max(y - laneY, this.getYLimit() - poolY, minLaneHeight);

      if (!source.ui) {
        return;
      }

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) {
        return;
      }

      if (!laneShape) {
        this.shape.resize(maxPoolWidth - labelWidth, maxPoolHeight, { direction });
        point.set('previousPosition', { x, y });
        this.updateAnchorPointPosition();
        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      } else {
        const sortedLanes = this.poolComponent.sortedLanes();
        if (this.shape === sortedLanes[sortedLanes.length - 1]) {
          if (maxPoolHeight < minLanePoolHeight) {
            return;
          }

          this.poolComponent.shape.resize(maxPoolWidth, maxPoolHeight, { direction });
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
          this.updateAnchorPointPosition(1);
        } else {
          this.shape.resize(maxLaneWidth, maxLaneHeight, { direction });
          point.set('previousPosition', { x, y });
          this.poolComponent.fillLanes(this.shape, direction);
          this.updateAnchorPointPosition(1);
        }
      }


      this.updateCrownPosition();
    },
    resizeBottomRight(point, newPosition, source) {
      const direction = 'bottom-right';
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
        this.shape.resize(maxPoolWidth, maxPoolHeight, { direction });
        point.set('previousPosition', { x, y });
        this.updateAnchorPointPosition();
        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      } else {
        const sortedLanes = this.poolComponent.sortedLanes();
        if (this.shape === sortedLanes[sortedLanes.length - 1]) {
          this.poolComponent.shape.resize(maxPoolWidth, maxPoolHeight, { direction });
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
          this.updateAnchorPointPosition(0);
        } else {
          if (maxLaneHeight < minLaneHeight) {
            return;
          }

          this.shape.resize(maxLaneWidth, maxLaneHeight, { direction });
          point.set('previousPosition', { x, y });
          this.poolComponent.fillLanes(this.shape, direction);
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
      const { x, y, width, height } = this.shape.getBBox();
      let leftEdge = x;

      if (this.node.type === 'processmaker-modeler-pool') {
        /* The pool label is positioned to the left of the pool;
         * account for it's width when positioning the drag handlers */
        leftEdge = leftEdge - labelWidth;
      }

      excludePoint !== 0 && this.anchorPoints[0].position(x + width, y + height); // Bottom Right Point
      excludePoint !== 1 && this.anchorPoints[1].position(leftEdge - this.pointWidth, y + height); // Bottom Left Point
      excludePoint !== 2 && this.anchorPoints[2].position(x + width, y - this.pointHeight); // Top Right Point
      excludePoint !== 3 && this.anchorPoints[3].position(leftEdge - this.pointWidth, y - this.pointWidth); //Top Left Point
    },
    setPointAttributes(point, cursorDirection) {
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
  },
  mounted() {
    this.$nextTick(() => {
      /* Use nextTick to ensure this code runs after the component it is mixed into mounts.
       * This will ensure this.shape is defined. */
      this.configureResize();
    });
  },
};
