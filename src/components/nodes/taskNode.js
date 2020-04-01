import Node from './node';

export default class TaskNode extends Node {
  static definitionPropertiesToNotCopy = ['$type', 'id'];

  clone(nodeRegistry, moddle, $t) {
    const definition = nodeRegistry[this.type].definition(moddle, $t);
    const diagram = nodeRegistry[this.type].diagram(moddle);
    const clonedNode = new TaskNode(this.type, definition, diagram);

    clonedNode.id = null;
    Node.diagramPropertiesToCopy.forEach(prop => clonedNode.diagram.bounds[prop] = this.diagram.bounds[prop]);
    Object.keys(this.definition)
      .filter(key => !TaskNode.definitionPropertiesToNotCopy.includes(key))
      .forEach(key => {
        clonedNode.definition[key] = this.definition[key];
      });

    return clonedNode;
  }
}
