import cloneDeepWith from 'lodash/cloneDeepWith';
import clone from 'lodash/clone';

export default class Node {
  type;
  definition;
  diagram;
  pool;

  constructor(type, definition, diagram) {
    this.type = type;
    this.definition = definition;
    this.diagram = diagram;
  }

  isBpmnType(type) {
    return this.definition.$type === type;
  }

  isType(type) {
    return this.type === type;
  }

  get id() {
    return this.definition.id;
  }

  set id(id) {
    this.definition.id = id;
  }

  setIds(nodeIdGenerator) {
    const [nodeId, diagramId] = nodeIdGenerator.generate();

    if (!this.id) {
      this.id = nodeId;
    }

    if (this.diagram) {
      this.diagram.id = diagramId;
      this.diagram.bpmnElement = this.definition;
    }
  }

  clone() {
    const diagramClone = cloneDeepWith(this.diagram, this.clearEventDefinitionRefs);
    return new Node(this.type, diagramClone.bpmnElement, diagramClone);
  }

  getTargetProcess(processes, processNode) {
    return this.pool
      ? processes.find(({ id }) => id === this.pool.component.node.definition.get('processRef').id)
      : processNode.definition;
  }

  clearEventDefinitionRefs(value) {
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
