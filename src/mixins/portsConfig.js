const markup = '<rect width="5" height="5" fill="blue"/>';

const top = { x: '50%', y: '0%' };
const topLeft = { x: '25%', y: '0%' };
const topRight = { x: '75%', y: '0%' };
const right = { x: '100%', y: '50%' };
const rightTop = { x: '100%', y: '25%' };
const rightBottom = { x: '100%', y: '75%' };
const bottom = { x: '50%', y: '100%' };
const bottomLeft = { x: '25%', y: '100%' };
const bottomRight = { x: '75%', y: '100%' };
const left = { x: '0%', y: '50%' };
const leftTop = { x: '0%', y: '25%' };
const leftBottom = { x: '0%', y: '75%' };
const center = { x: '50%', y: '50%' };

const portPositions = [top, topLeft, topRight, right, rightTop, rightBottom, bottom, bottomLeft, bottomRight, left, leftTop, leftBottom, center];
const ports = portPositions.map(position => ({group: 'absolute', args: position, markup}));
export default {
  async mounted() {
    await this.$nextTick();

    this.shape.attributes.ports = {};
    this.shape.attributes.ports.groups = {
      absolute: {
        position: {
          name: 'absolute',
        },
      },
    };
    this.shape.addPorts(ports);
  },
};
