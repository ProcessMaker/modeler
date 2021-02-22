import NodeIdGenerator from '@/NodeIdGenerator';
import zip from 'lodash/zip';

function definitionsFactory(definitionIds = [], diagramIds = []) {
  const planeElement = zip(definitionIds, diagramIds).map(([definitionId, diagramId]) => ({
    $type: 'bpmndi:BPMNShape',
    id: diagramId,
    bpmnElement: { $type: 'bpmn:task', id: definitionId },
    get(key) {
      return this[key];
    },
  }));
  return {
    diagrams: [{
      $type: 'bpmndi:BPMNDiagram',
      plane: {
        $type: 'bpmndi:BPMNPlane',
        planeElement,
        get(key) {
          return this[key];
        },
      },
    }],
  };
}

describe('NodeIdGenerator', () => {
  it.each([['definition', 0], ['diagram', 1]])('should generate unique %s IDs', (name, idIndex) => {
    const generator = new NodeIdGenerator(definitionsFactory());
    const ids = [];
    const numberOfIdsToGenerate = 10;

    for (let i = 0; i < numberOfIdsToGenerate; i++) {
      ids.push(generator.generate()[idIndex]);
    }

    while (ids.length > 0) {
      expect(ids).not.toContain(ids.pop());
    }
  });

  it('should not generate definition IDs that already exist in definitions', () => {
    const duplicateGenerator = new NodeIdGenerator(definitionsFactory());
    const definitionIds = [
      duplicateGenerator.generate()[0],
      duplicateGenerator.generate()[0],
      duplicateGenerator.generate()[0],
    ];
    const generator = new NodeIdGenerator(definitionsFactory(definitionIds));
    const newDefinitionIds = [
      generator.generate()[0],
      generator.generate()[0],
      generator.generate()[0],
      generator.generate()[0],
    ];

    while (newDefinitionIds.length > 0) {
      expect(definitionIds).not.toContain(newDefinitionIds.pop());
    }
  });

  it('should not generate diagram IDs that already exist in definitions', () => {
    const duplicateGenerator = new NodeIdGenerator(definitionsFactory());
    const diagramIds = [
      duplicateGenerator.generate()[1],
      duplicateGenerator.generate()[1],
      duplicateGenerator.generate()[1],
    ];
    const generator = new NodeIdGenerator(definitionsFactory([], diagramIds));

    const newDefinitionIds = [
      generator.generate()[1],
      generator.generate()[1],
      generator.generate()[1],
      generator.generate()[1],
    ];

    while (newDefinitionIds.length > 0) {
      expect(diagramIds).not.toContain(newDefinitionIds.pop());
    }
  });
});
