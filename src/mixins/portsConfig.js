export const portGroups = ['top', 'right', 'bottom', 'left', 'absolute'];

const groups = portGroups.reduce((groups, group) => {
  groups[group] = {
    position: {
      name: group,
      args: group === 'absolute' ? { x: '50%', y: '50%' } : null,
    },
  };

  return groups;
}, {});
const markup = '<rect width="1" height="1" fill="none"/>';
const ports = portGroups.map(group => ({ group, markup }));

export default {
  async mounted() {
    await this.$nextTick();

    this.shape.attributes.ports = {};
    this.shape.attributes.ports.groups = groups;
    this.shape.addPorts(ports);
  },
};
