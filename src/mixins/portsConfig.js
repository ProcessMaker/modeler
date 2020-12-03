const markup = '<rect width="1" height="1" fill="none"/>';
export const defaultGroup = 'default';
export const boundaryGroup = 'boundary';
export const rectangleGroup = 'rectangle';

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

const edgePorts = [top, topLeft, topRight, right, rightTop, rightBottom, bottom, bottomLeft, bottomRight, left, leftTop, leftBottom];

const toGroup = (groupName) => (position) => {
  return {
    group: groupName,
    args: position,
    markup,
  };
};

const defaultPorts = [top, right, left, bottom, center].map(toGroup(defaultGroup));
const boundaryPorts = edgePorts.map(toGroup(boundaryGroup));
const rectangularPorts = [...edgePorts, center].map(toGroup(rectangleGroup));

export default {
  async mounted() {
    await this.$nextTick();

    this.shape.attributes.ports = {};
    this.shape.attributes.ports.groups = {
      [defaultGroup]: {
        position: {
          name: 'absolute',
        },
      },
      [boundaryGroup]: {
        position: {
          name: 'absolute',
        },
      },
      [rectangleGroup]: {
        position: {
          name: 'absolute',
        },
      },
    };
    this.shape.addPorts([...defaultPorts, ...boundaryPorts, ...rectangularPorts]);
  },
};
