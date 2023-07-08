import Node from '@/components/nodes/node';

const definitionFactory = (props = {}) => ({
  ...props,
  get(prop) { return this[prop]; },
  set(prop, val) { this[prop] = val; },
});
const mockType = 'some-type';
const mockNodeRegistry = {
  [mockType]: {
    definition() {
      return definitionFactory();
    },
    diagram() {
      return { bounds: {} };
    },
  },
};

describe('Node', () => {
  let definition;
  let bounds;
  let node;

  beforeEach(() => {
    definition = definitionFactory({ id: 123, name: 'name' });
    bounds = { x: 1, y: 2, width: 3, height: 4 };
    node = new Node(mockType, definition, { bpmnElement: definition, bounds });
  });

  it('clone should return an object not equal to itself', () => {
    let clonedNode = node.clone(mockNodeRegistry);

    expect(clonedNode).not.toBe(node);
    expect(clonedNode.definition).not.toBe(node.definition);
    expect(clonedNode.diagram).not.toBe(node.diagram);
    expect(clonedNode.diagram.bounds).not.toBe(node.diagram.bounds);
    expect(clonedNode.diagram.bpmnElement).not.toBe(node.definition);
  });

  it('clone should copy definition name and color, and diagram bounds', () => {
    definition.color = '#357bf6';
    let clonedNode = node.clone(mockNodeRegistry);

    expect(clonedNode.definition.name).toBe(node.definition.name);
    expect(clonedNode.definition.color).toBe(node.definition.color);
    Node.diagramPropertiesToCopy.forEach(prop => {
      expect(clonedNode.diagram.bounds[prop]).toBe(node.diagram.bounds[prop]);
    });
  });
});
