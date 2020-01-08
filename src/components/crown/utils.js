export function removeFlows(graph, shape) {
  graph.getConnectedLinks(this.shape).forEach(shape => this.$emit('remove-node', shape.component.node));
  shape.getEmbeddedCells({ deep: true }).forEach(cell => {
    if (cell.component) {
      graph.getConnectedLinks(cell).forEach(shape => this.$emit('remove-node', shape.component.node));
      shape.unembed(cell);
      this.$emit('remove-node', cell.component.node);
    }
  });
}
