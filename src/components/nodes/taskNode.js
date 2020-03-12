import Node from './node';
import cloneDeepWith from 'lodash/cloneDeepWith';
import clone from 'lodash/clone';

export default class TaskNode extends Node {
  clone() {
    const diagramClone = cloneDeepWith(this.diagram, this.clearEventDefinitionRefs);
    const clonedNode = new TaskNode(this.type, diagramClone.bpmnElement, diagramClone);
    clonedNode.id = null;
    Node.diagramPropertiesToCopy.forEach(prop => clonedNode.diagram.bounds[prop] = this.diagram.bounds[prop]);
    clonedNode.definition.name = this.definition.name;

    return clonedNode;
  }

  clearEventDefinitionRefs(value) {
    if (!value) {
      return;
    }

    const refValueKeys = ['errorRef', 'messageRef'];
    const refValueKey = Object.keys(value).find(key => refValueKeys.includes(key));

    if (!refValueKey) {
      return;
    }

    const clonedValue = clone(value);
    clonedValue[refValueKey] = null;
    return clonedValue;
  }
}
