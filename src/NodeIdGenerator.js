export default class NodeIdGenerator {
  static prefix = 'node_';

  constructor(definitions) {
    this.counter = 1;
    this.definitions = definitions;
  }

  generate() {
    let id = this.#generateNewId();

    while (!this.#isIdUnique(id)) {
      id = this.#generateNewId();
    }

    return [id, `${id}_di`];
  }

  #generateNewId = () => {
    const id = NodeIdGenerator.prefix + this.counter;
    this.counter++;

    return id;
  };

  #isIdUnique = id => {
    const planeElementIds = this.definitions.diagrams[0].plane
      .get('planeElement')
      .map(planeElement => planeElement.get('bpmnElement').id);

    return !planeElementIds.includes(id);
  };
}
