export default class NodeIdGenerator {
  static prefix = 'node_';

  static #counter = 1;
  static #diagramCounter = 1;

  constructor(definitions) {
    this.definitions = definitions;
    this.refreshLastIdCounter();
    this.refreshLastDiagramIdCounter();
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

  matchIds(idRegex, root, walked = [], lastIdCounter = 0) {
    if (walked.indexOf(root) > -1) return lastIdCounter;
    if (root instanceof Array) {
      walked.push(root);
      root.forEach(item => lastIdCounter = this.matchIds(idRegex, item, walked, lastIdCounter));
    } else if (root instanceof Object) {
      walked.push(root);
      if (root.id) {
        const match = String(root.id).match(idRegex);
        const idCounter = match ? parseInt(match[1]) : 0;
        if (idCounter > lastIdCounter) {
          lastIdCounter = idCounter;
        }
      }
      Object.getOwnPropertyNames(root).forEach(key => {
        if (!(root[key] instanceof Function) && (key.substring(0, 1) !== '$')) {
          lastIdCounter = this.matchIds(idRegex, root[key], walked, lastIdCounter);
        }
      });
    }
    return lastIdCounter;
  }

  refreshLastIdCounter() {
    let lastIdCounter = this.matchIds(new RegExp(`^${NodeIdGenerator.prefix}(\\d+)$`), this.definitions.rootElements);
    NodeIdGenerator.#counter = lastIdCounter + 1;
  }

  getCounter() {
    this.refreshLastIdCounter();
    return NodeIdGenerator.#counter;
  }

  refreshLastDiagramIdCounter() {
    let lastIdCounter = this.matchIds(new RegExp(`^${NodeIdGenerator.prefix}(\\d+)_di$`), this.definitions.diagrams);
    NodeIdGenerator.#diagramCounter = lastIdCounter + 1;
  }

  generate() {
    let definitionId = this.#generateDefinitionId();
    let diagramId = this.#generateDiagramId();
    return [definitionId, diagramId];
  }

  #generateDefinitionId = () => {
    const id = NodeIdGenerator.prefix + NodeIdGenerator.#counter;
    NodeIdGenerator.#counter++;

    return id;
  };

  #generateDiagramId = () => {
    const id = NodeIdGenerator.prefix + NodeIdGenerator.#diagramCounter + '_di';
    NodeIdGenerator.#diagramCounter++;

    return id;
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
