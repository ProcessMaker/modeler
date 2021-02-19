export default class NodeIdGenerator {
  static prefix = 'node_';

  #counter = 1;
  #diagramCounter = 1;

  constructor(definitions) {
    this.definitions = definitions;
    // randomize initial counter
    this.#counter = Math.round(Math.random() * 100) * 100 + 1;
    this.#diagramCounter = Math.round(Math.random() * 100) * 100 + 1;
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
    const planeElementIds = this.definitions.diagrams[0].plane
      .get('planeElement')
      .map(planeElement => planeElement.get('bpmnElement').id);

    return !planeElementIds.includes(id);
  };

  #isDiagramIdUnique = id => {
    const diagramElementIds = this.definitions.diagrams[0].plane
      .get('planeElement')
      .map(planeElement => planeElement.id);

    return !diagramElementIds.includes(id);
  };
}
