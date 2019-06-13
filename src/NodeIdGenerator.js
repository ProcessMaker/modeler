const nodeIdPrefix = 'node_';

export default class NodeIdGenerator {
  constructor(definitions) {
    this.counter = 1;
    this.definitions = definitions;
  }

  generateUniqueNodeId() {
    let id = this.generateNewNodeId();

    while (!this.isIdUnique(id)) {
      id = this.generateNewNodeId();
    }

    return id;
  }

  generateNewNodeId(prefix = nodeIdPrefix) {
    const id = prefix + this.counter;
    this.counter++;

    return id;
  }

  isIdUnique(id) {
    const planeElementIds = this.definitions.diagrams[0].plane
      .get('planeElement')
      .map(planeElement => planeElement.get('bpmnElement').id);

    return !planeElementIds.includes(id);
  }
}
