import { shapes } from 'jointjs';
import resizeIcon from '@/assets/highlight-shape.svg';
import { labelWidth, minPoolHeight, minPoolWidth, poolPadding } from '@/components/nodes/pool/poolSizes';
import { minLaneHeight, minLaneWidth } from '@/components/nodes/poolLane/laneSizes';
import get from 'lodash/get';
import store from '@/store';
import { id as laneId } from '@/components/nodes/poolLane/config';

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
        this.updateAnchorPointPosition();
      } else {
        this.removeResizeAnchors();
      }
    },
  },
  computed:{
    poolComponent() {
      return get(this, 'node.pool.component', this);
    },
    isLane() {
      return this.node.type === 'processmaker-modeler-lane';
    },
  },
  methods: {
    calculateElementLimits() {
      this.elementBounds = this.poolComponent.shape.getEmbeddedCells()
        .filter(element => element.component && element.component.node.type !== laneId && element.component.node.type !== 'processmaker-modeler-message-flow')
        .map(element => element.getBBox());

      this.elementTopY = Math.min(...this.elementBounds.map(({ y }) => y - poolPadding));
      this.elementBottomY = Math.max(...this.elementBounds.map(({ y, height }) => y + height + poolPadding));
      this.elementRightX = Math.max(...this.elementBounds.map(({ x, width }) => x + width + poolPadding));
      this.elementLeftX = Math.min(...this.elementBounds.map(({ x }) => x - poolPadding));
    },
    configureResize() {
      this.shape.listenTo(this.paper, 'element:pointerup', cellView => {
        if (cellView.model.component && cellView.model.component === this) {
          /* Resize limits must be re-calculated if the the pool or lane is moved */
          this.calculateElementLimits();
        }
      });

      const pointBottomRight = new shapes.standard.EmbeddedImage();
      const pointBottomLeft = new shapes.standard.EmbeddedImage();
      const pointTopRight = new shapes.standard.EmbeddedImage();
      const pointTopLeft = new shapes.standard.EmbeddedImage();

      this.anchorPoints = [
        pointBottomRight,
        pointBottomLeft,
        pointTopRight,
        pointTopLeft,
      ];

      const { x, y, width, height } = this.shape.getBBox();

      this.anchorPoints.forEach(point => {
        point.set('isDrag', true);
        point.set('previousPosition', point.position());
      });

      if (this.highlighted) {
        this.addResizeAnchors();
      }

      this.setPointAttributes(pointBottomRight, 'nwse-resize', 'bottom-right-resize-button');
      this.setPointAttributes(pointBottomLeft, 'nesw-resize', 'bottom-left-resize-button');
      this.setPointAttributes(pointTopRight, 'nesw-resize', 'top-right-resize-button');
      this.setPointAttributes(pointTopLeft, 'nwse-resize', 'top-left-resize-button');

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
    fixResizeRounding() {
      /* Resizing causes rounding errors.
       * E.g. Setting 180.0000000000001 instead of 180.
       * Re-position pool based on rounded values.
       */
      const { x, y, width, height } = this.poolComponent.shape.getBBox();

      this.poolComponent.shape.resize(
        Math.round(width),
        Math.round(height)
      );
      this.poolComponent.shape.position(
        Math.round(x),
        Math.round(y)
      );
    },
    resizeUpdate() {
      this.fixResizeRounding();

      const { width, height } = this.shape.getBBox();
      const bounds = this.node.diagram.bounds;
      if (width !== bounds.width || height !== bounds.height) {
        if (this.poolComponent.laneSet) {
          this.poolComponent.updateLaneChildren();

          this.poolComponent.sortedLanes().forEach(laneShape => {
            store.commit('updateNodeBounds', {
              node: laneShape.component.node,
              bounds: laneShape.getBBox(),
            });
          });
        }

        store.commit('updateNodeBounds', {
          node: this.poolComponent.node,
          bounds: this.poolComponent.shape.getBBox(),
        });

        this.$emit('save-state');
      }
    },
    resizeTopLeft(point, newPosition, source) {
      if (!source.ui) { return; }

      const direction = 'top-left';
      const { x, y } = newPosition;

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) { return; }

      const { x: poolX, y: poolY, width: poolWidth, height: poolHeight } = this.poolComponent.shape.getBBox();
      const { x: laneX, y: laneY, width: laneWidth, height: laneHeight } = this.shape.getBBox();
      const sortedLanes = this.poolComponent.sortedLanes();
      const minHeight = sortedLanes.slice(1).reduce((height, lane) => {
        return height + lane.getBBox().height;
      }, minLaneHeight);
      const maxPoolWidth = Math.max(
        (poolX + poolWidth) - (x + this.pointWidth),
        (poolX + poolWidth) - this.elementLeftX + labelWidth,
        minPoolWidth
      );
      const maxPoolHeight = Math.max(
        (poolY + poolHeight) - (y + this.pointWidth),
        poolY + poolHeight - this.elementTopY,
        this.poolComponent.laneSet ? minHeight : minPoolHeight
      );
      const maxLaneWidth = Math.max(
        (laneX + laneWidth) - (x + this.pointWidth),
        (laneX + laneWidth) - this.elementLeftX + poolPadding + labelWidth,
        minLaneWidth
      );
      const maxLaneHeight = Math.max(
        (laneY + laneHeight) - (y + this.pointHeight),
        minLaneHeight
      );

      if (this.isLane) {
        /* When resizing a lane, we only have to consider the lane's min size,
         * and the min size of the lane above (if any) */
        if (this.shape === sortedLanes[0]) {
          const maxPoolWidthLane = Math.max(
            (poolX + poolWidth) - (x + this.pointWidth) + labelWidth,
            (poolX + poolWidth) - this.elementLeftX + labelWidth,
            minPoolWidth
          );

          this.poolComponent.shape.resize(maxPoolWidthLane, maxPoolHeight, { direction });
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
        } else {
          const aboveLane = sortedLanes[sortedLanes.indexOf(this.shape) - 1];
          this.shape.resize(
            maxLaneWidth,
            Math.min(laneY + laneHeight - (aboveLane.getBBox().y + minLaneHeight), maxLaneHeight),
            { direction });

          point.set('previousPosition', { x, y });
          this.poolComponent.fillLanes(this.shape, direction);
        }
      } else {
        /* When resizing a pool, we have to consider the pool's min size,
         * the min size of the top and bottom lanes (if any), and the
         * location of elements around the pools edge (if any) */
        point.set('previousPosition', { x, y });
        this.shape.resize(maxPoolWidth, maxPoolHeight, { direction });

        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      }

      this.updateAnchorPointPosition();
    },
    resizeTopRight(point, newPosition, source) {
      if (!source.ui) { return; }

      const direction = 'top-right';
      const { x, y } = newPosition;

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) { return; }

      const { x: poolX, y: poolY, height: poolHeight } = this.poolComponent.shape.getBBox();
      const { x: laneX, y: laneY, height: laneHeight } = this.shape.getBBox();
      const sortedLanes = this.poolComponent.sortedLanes();
      const minHeight = sortedLanes.slice(1).reduce((height, lane) => {
        return height + lane.getBBox().height;
      }, minLaneHeight);

      const maxPoolWidth = Math.max(
        x - poolX,
        this.elementRightX - poolX,
        minPoolWidth
      );
      const maxPoolHeight = Math.max(
        (poolY + poolHeight) - (y + this.pointWidth),
        poolY + poolHeight - this.elementTopY,
        this.poolComponent.laneSet ? minHeight : minPoolHeight
      );
      const maxLaneWidth = Math.max(
        x - laneX,
        this.elementRightX - laneX,
        minLaneWidth
      );
      const maxLaneHeight = Math.max(
        (laneY + laneHeight) - (y + this.pointHeight),
        minLaneHeight
      );

      if (this.isLane) {
        /* When resizing a lane, we only have to consider the lane's min size,
         * and the min size of the lane above (if any) */

        if (this.shape === sortedLanes[0]) {
          this.poolComponent.shape.resize(maxPoolWidth, maxPoolHeight, { direction });
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
        } else {
          const aboveLane = sortedLanes[sortedLanes.indexOf(this.shape) - 1];
          this.shape.resize(
            maxLaneWidth,
            Math.min(laneY + laneHeight - (aboveLane.getBBox().y + minLaneHeight), maxLaneHeight),
            { direction });

          point.set('previousPosition', { x, y });
          this.poolComponent.fillLanes(this.shape, direction);
        }
      } else {
        /* When resizing a pool, we have to consider the pool's min size,
         * the min size of the top and bottom lanes (if any), and the
         * location of elements around the pools edge (if any) */

        this.shape.resize(maxPoolWidth, maxPoolHeight, { direction });
        point.set('previousPosition', { x, y });

        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      }

      this.updateAnchorPointPosition();
    },
    resizeBottomLeft(point, newPosition, source) {
      if (!source.ui) { return; }

      const direction = 'bottom-left';
      const { x, y } = newPosition;

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) { return; }

      const { x: poolX, y: poolY, width: poolWidth } = this.poolComponent.shape.getBBox();
      const { x: laneX, y: laneY, width: laneWidth } = this.shape.getBBox();
      const sortedLanes = this.poolComponent.sortedLanes();
      const minHeight = sortedLanes.slice(0, sortedLanes.length -1).reduce((height, lane) => {
        return height + lane.getBBox().height;
      }, minLaneHeight);

      const maxPoolWidth = Math.max(
        (poolX + poolWidth) - (x + this.pointWidth),
        (poolX + poolWidth) - this.elementLeftX + labelWidth,
        minPoolWidth
      );
      const maxPoolHeight = Math.max(
        y - poolY,
        this.elementBottomY - poolY,
        this.poolComponent.laneSet ? minHeight : minPoolHeight
      );
      const maxLaneWidth = Math.max(
        (laneX + laneWidth) - (x + this.pointWidth),
        (laneX + laneWidth) - this.elementLeftX + poolPadding + labelWidth,
        minLaneWidth
      );
      const maxLaneHeight = Math.max(
        y - laneY,
        minLaneHeight
      );

      if (this.isLane) {
        /* When resizing a lane, we only have to consider the lane's min size,
         * and the min size of the lane above (if any) */

        if (this.shape === sortedLanes[sortedLanes.length -1]) {
          const maxPoolWidthLane = Math.max(
            (poolX + poolWidth) - (x + this.pointWidth) + labelWidth,
            (poolX + poolWidth) - this.elementLeftX + labelWidth,
            minPoolWidth
          );

          this.poolComponent.shape.resize(maxPoolWidthLane, maxPoolHeight, { direction });
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
        } else {
          const belowLane = sortedLanes[sortedLanes.indexOf(this.shape) + 1];
          this.shape.resize(
            maxLaneWidth,
            Math.min(((belowLane.getBBox().y + belowLane.getBBox().height) - minLaneHeight) - laneY, maxLaneHeight ),
            { direction });

          point.set('previousPosition', { x, y });
          this.poolComponent.fillLanes(this.shape, direction);
        }
      } else {
        /* When resizing a pool, we have to consider the pool's min size,
         * the min size of the top and bottom lanes (if any), and the
         * location of elements around the pools edge (if any) */

        this.shape.resize(maxPoolWidth, maxPoolHeight, { direction });
        point.set('previousPosition', { x, y });

        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      }

      this.updateAnchorPointPosition();
    },
    resizeBottomRight(point, newPosition, source) {
      if (!source.ui) { return; }

      const direction = 'bottom-right';
      const { x, y } = newPosition;

      if (point.get('previousPosition').x === x && point.get('previousPosition').y === y) { return; }

      const { x: poolX, y: poolY } = this.poolComponent.shape.getBBox();
      const { x: laneX, y: laneY } = this.shape.getBBox();
      const sortedLanes = this.poolComponent.sortedLanes();
      const minHeight = sortedLanes.slice(0, sortedLanes.length -1).reduce((height, lane) => {
        return height + lane.getBBox().height;
      }, minLaneHeight);
      const maxPoolWidth = Math.max(x - poolX, this.elementRightX - poolX, minPoolWidth);
      const maxPoolHeight = Math.max(
        y - poolY,
        this.elementBottomY - poolY,
        this.poolComponent.laneSet ? minHeight : minPoolHeight
      );
      const maxLaneWidth = Math.max(
        x - laneX,
        this.elementRightX - laneX,
        minLaneWidth
      );
      const maxLaneHeight = Math.max(
        y - laneY,
        minLaneHeight
      );

      if (this.isLane) {
        /* When resizing a lane, we only have to consider the lane's min size,
         * and the min size of the lane above (if any) */

        if (this.shape === sortedLanes[sortedLanes.length -1]) {
          this.poolComponent.shape.resize(maxPoolWidth, maxPoolHeight, { direction });
          point.set('previousPosition', { x, y });
          this.poolComponent.resizeLanes();
        } else {
          const belowLane = sortedLanes[sortedLanes.indexOf(this.shape) + 1];
          this.shape.resize(
            maxLaneWidth,
            Math.min(((belowLane.getBBox().y + belowLane.getBBox().height) - minLaneHeight) - laneY, maxLaneHeight ),
            { direction });

          point.set('previousPosition', { x, y });
          this.poolComponent.fillLanes(this.shape, direction);
        }
      } else {
        /* When resizing a pool, we have to consider the pool's min size,
         * the min size of the top and bottom lanes (if any), and the
         * location of elements around the pools edge (if any) */

        this.shape.resize(maxPoolWidth, maxPoolHeight, { direction });
        point.set('previousPosition', { x, y });

        if (this.laneSet) {
          this.poolComponent.resizeLanes();
        }
      }

      this.updateAnchorPointPosition();
    },
    addResizeAnchors() {
      this.anchorPoints.forEach(button => {
        try {
          this.shape.embed(button);
        } catch (error) {
          /* There is an error when re-adding points after removing/re-adding the pool.
           * Ignore it for now. */
        }

        button.addTo(this.graph);
        button.toFront();
      });
    },
    removeResizeAnchors() {
      this.anchorPoints.forEach(button => {
        button.remove();
      });
    },
    updateAnchorPointPosition(excludePoint) {
      if (this.anchorPoints.length === 0) {
        return;
      }
      const { x, y, width, height } = this.shape.getBBox();

      excludePoint !== 0 && this.anchorPoints[0].position(x + width, y + height); // Bottom Right Point
      excludePoint !== 1 && this.anchorPoints[1].position(x - this.pointWidth, y + height); // Bottom Left Point
      excludePoint !== 2 && this.anchorPoints[2].position(x + width, y - this.pointHeight); // Top Right Point
      excludePoint !== 3 && this.anchorPoints[3].position(x - this.pointWidth, y - this.pointWidth); //Top Left Point
    },
    setPointAttributes(point, cursorDirection, buttonId) {
      point.attr({
        body: {
          fill: '#fff',
          stroke: ' #fff',
          opacity: 0.8,
        },
        image: {
          xlinkHref: resizeIcon,
          cursor: cursorDirection,
          buttonId,
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
