import Node from '@/components/nodes/node';

describe('Node', () => {
  it('should create a clone of itself', () => {
    const definition = { id: 123, name: 'name', eventDefinitions: [{}] };
    const node = new Node('type', definition, { bpmnElement: definition });
    const clonedNode = node.clone();

    expect(clonedNode).not.toBe(node);
    expect(clonedNode).toEqual(node);
    
    expect(clonedNode.definition).not.toBe(node.definition);
    expect(clonedNode.diagram).not.toBe(node.diagram);
    expect(clonedNode.diagram.bpmnElement).not.toBe(node.definition);
    expect(clonedNode.diagram.bpmnElement).toBe(clonedNode.definition);
  });
});
