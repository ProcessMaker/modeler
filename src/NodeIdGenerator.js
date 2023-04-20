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
      Object.getOwnPropertyNames(root).find(key => found = !(root[key] instanceof Function) && (key.substring(0, 1) !== '$') && this.findById(id, root[key], walked));
    }
    return found;
  }

  refreshLastIdCounter() {
    let lastIdCounter = 0;
    const idRegex = new RegExp(`^${NodeIdGenerator.prefix}(\\d+)$`);
    this.definitions.rootElements.forEach(element => {
      const id = element.id;
      if (idRegex.test(id)) {
        const idCounter = parseInt(id.match(idRegex)[1]);
        if (idCounter > lastIdCounter) {
          lastIdCounter = idCounter;
        }
      }
    });
    this.#counter = lastIdCounter + 1;
  }

  generate() {
    let definitionId = this.#generateDefinitionId();
    let diagramId = this.#generateDiagramId();
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

// Singleton instance
let singleton = null;

export function getNodeIdGenerator(definitions) {
  if (!singleton) {
    singleton = new NodeIdGenerator(definitions);
  }
  return singleton;
}
