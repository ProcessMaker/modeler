import joint from 'jointjs';

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

      if(!this.resizeConfig) {
        this.resizeConfig = [];
      }

      this.resizeConfig.forEach(({ icon, clickHandler }) => {
        const point = new joint.shapes.standard.EmbeddedImage();
        const { width, height } = this.shape.get('size');

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
            xlinkHref: icon,
            cursor: 'nwse-resize',
            refWidth: 20,
            refHeight: 20,
            resetOffset: true,
          },
        });

        this.shape.embed(point);
        point.addTo(this.graph);

        point.position(width, height, {parentRelative: true});
        const previousPosition = point.position();

        point.on('change:position', (element, newPosition) => {
          const { x, y } = newPosition;
          const { x: poolX, y: poolY } = this.shape.position();

          if(previousPosition.x === x && previousPosition.y === y) {
            return;
          }

          this.shape.resize(Math.max(x - poolX, 300), Math.max(y - poolY, 60));
          if (x < 300 || y < 60) {
            point.position(Math.max(x, 300), Math.max(y, 60),{
              parentRelative: true,
            });
          }

          previousPosition.x = x;
          previousPosition.y = y;

          if(this.laneSet) {
            this.resizeLanes();
            console.log('resize lanee');
            console.log(x,y);
          }
          this.updateCrownPosition();
        });

      });
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
    updateAnchorPointPosition(){
      this.anchorPoints.forEach((point, index) => {
        const { x, y, width, height } = this.shape.findView(this.paper).getBBox();
        const { tx, ty } = this.paper.translate();
        const crownHeight = (this.anchorPoints.length) + ((this.anchorPoints.length - 1));
        const centerY = 0 - (crownHeight) + (height);

        this.anchorPoints.forEach((point, index) => {
          const yOffset = index;

          point.position(x + width - tx, y + yOffset + centerY - ty);
        });
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
  // beforeDestroy() {
  //   this.graph.getConnectedLinks(this.shape).forEach(shape => this.$emit('remove-node', shape.component.node));
  //   this.shape.getEmbeddedCells().forEach(cell => {
  //     if (cell.component) {
  //       this.shape.unembed(cell);
  //       this.$emit('remove-node', cell.component.node);
  //     }
  //   });
  // },
  // destroyed() {
  //   this.shape.stopListening();
  //   this.shape.remove();
  // },
};
