export function removeFlows(graph, shape) {
  graph.getConnectedLinks(shape).forEach(shape => this.$emit('remove-node', shape.component.node));
  shape.getEmbeddedCells({ deep: true })
    .filter(cell => cell.component)
    .forEach(cell => {
      graph.getConnectedLinks(cell).forEach(shape => this.$emit('remove-node', shape.component.node));
      shape.unembed(cell);
      this.$emit('remove-node', cell.component.node);
    });
}
