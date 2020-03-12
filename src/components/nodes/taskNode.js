import Node from './node';
import cloneDeep from 'lodash/cloneDeep';

export default class TaskNode extends Node {
  clone() {
    const diagramClone = cloneDeep(this.diagram);
    const clonedNode = new TaskNode(this.type, diagramClone.bpmnElement, diagramClone);
    clonedNode.id = null;
    Node.diagramPropertiesToCopy.forEach(prop => clonedNode.diagram.bounds[prop] = this.diagram.bounds[prop]);
    clonedNode.definition.name = this.definition.name;

    return clonedNode;
  }
}
