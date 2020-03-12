import Node from './node';
import cloneDeep from 'lodash/cloneDeep';

export default class TaskNode extends Node {
  clone(nodeRegistry, moddle, $t) {
    let definition = nodeRegistry[this.type].definition(moddle, $t);
    const diagramClone = cloneDeep(this.diagram);

    if (diagramClone.bpmnElement) {
      definition = diagramClone.bpmnElement;
    }
    const clonedNode = new TaskNode(this.type, definition, diagramClone);
    clonedNode.id = null;
    Node.diagramPropertiesToCopy.forEach(prop => clonedNode.diagram.bounds[prop] = this.diagram.bounds[prop]);
    clonedNode.definition.name = this.definition.name;

    return clonedNode;
  }
}
