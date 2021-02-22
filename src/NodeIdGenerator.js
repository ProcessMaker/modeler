export default class NodeIdGenerator {
  static prefix = 'node_';

  #counter = 1;
  #diagramCounter = 1;

  constructor(definitions) {
    this.definitions = definitions;
  }

  findById(id, root = this.definitions.rootElements, walked = []) {
    if (walked.indexOf(root) > -1) return;
    let found;
    if (root instanceof Array) {
      walked.push(root);
      root.find(item => found = this.findById(id, item, walked));
    } else if (root instanceof Object && root.$type) {
      walked.push(root);
      if (root.id === id) return root;
      Object.getOwnPropertyNames(root).find(key => found = !(root[key] instanceof Function) && this.findById(id, root[key], walked));
    }
    return found;
  }

  generate() {
    let definitionId = this.#generateDefinitionId();
    let diagramId = this.#generateDiagramId();

    while (!this.#isDefinitionIdUnique(definitionId)) {
      definitionId = this.#generateDefinitionId();
    }

    while (!this.#isDiagramIdUnique(diagramId)) {
      diagramId = this.#generateDiagramId();
    }

    return [definitionId, diagramId];
  }

  #generateDefinitionId = () => {
    const id = NodeIdGenerator.prefix + this.#counter;
    this.#counter++;

    return id;
  };

  #generateDiagramId = () => {
    const id = NodeIdGenerator.prefix + this.#diagramCounter + '_di';
    this.#diagramCounter++;

    return id;
  };

  #isDefinitionIdUnique = id => {
    return !this.findById(id) && !this.findById(id, this.definitions.diagrams);
  };

  #isDiagramIdUnique = id => {
    return !this.findById(id) && !this.findById(id, this.definitions.diagrams);
  };
}
