const nodeIdPrefix = 'node_';

export default class NodeIdGenerator {
  constructor(definitions) {
    this.counter = 1;
    this.definitions = definitions;
  }

  generate() {
    let id = this.#generateNewId();

    while (!this.#isIdUnique(id)) {
      id = this.#generateNewId();
    }

    return id;
  }

  #generateNewId = (prefix = nodeIdPrefix, suffix = '') => {
    const id = prefix + this.counter + suffix;
    this.counter++;

    return id;
  }

  #isIdUnique = id => {
    const planeElementIds = this.definitions.diagrams[0].plane
      .get('planeElement')
      .map(planeElement => planeElement.get('bpmnElement').id);

    return !planeElementIds.includes(id);
  }
}
