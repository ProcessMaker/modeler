export function getSubProcessBpmnDiagram(definitions, subProcessDefinition) {
  if (!definitions?.diagrams?.length || !subProcessDefinition) {
    return null;
  }

  return definitions.diagrams.find((diagram) => {
    const planeElement = diagram.plane?.bpmnElement;
    if (!planeElement) {
      return false;
    }
    return planeElement === subProcessDefinition || planeElement.id === subProcessDefinition.id;
  });
}

export function getSubProcessPlane(definitions, subProcessDefinition) {
  return getSubProcessBpmnDiagram(definitions, subProcessDefinition)?.plane ?? null;
}

export function removeSubProcessBpmnDiagram(definitions, subProcessDefinition) {
  const diagrams = definitions?.get?.('diagrams') || definitions?.diagrams;
  if (!diagrams?.length || !subProcessDefinition) {
    return;
  }

  const diagramIndex = diagrams.findIndex((diagram) => {
    const planeElement = diagram.plane?.bpmnElement;
    if (!planeElement) {
      return false;
    }
    return planeElement === subProcessDefinition || planeElement.id === subProcessDefinition.id;
  });

  if (diagramIndex > 0) {
    diagrams.splice(diagramIndex, 1);
  }
}

/**
 * Drops extra BPMNDiagram entries that no longer match an embedded bpmn:SubProcess in the model.
 */
export function pruneOrphanSubProcessDiagrams(definitions) {
  const diagrams = definitions?.get?.('diagrams') || definitions?.diagrams;
  if (!diagrams || diagrams.length <= 1) {
    return;
  }

  const validSubProcessIds = new Set(
    collectSubProcessDefinitions(definitions.rootElements || []).map(({ id }) => id),
  );

  for (let index = diagrams.length - 1; index >= 1; index -= 1) {
    const subprocessElement = diagrams[index].plane?.bpmnElement;
    if (!subprocessElement || subprocessElement.$type !== 'bpmn:SubProcess') {
      diagrams.splice(index, 1);
      continue;
    }
    if (!validSubProcessIds.has(subprocessElement.id)) {
      diagrams.splice(index, 1);
    }
  }
}

export function getOrCreateSubProcessBpmnDiagram(moddle, definitions, subProcessDefinition) {
  let diagram = getSubProcessBpmnDiagram(definitions, subProcessDefinition);

  if (!diagram) {
    diagram = moddle.create('bpmndi:BPMNDiagram', {
      id: `${subProcessDefinition.id}_diagram`,
      name: subProcessDefinition.get('name') || subProcessDefinition.id,
    });
    const plane = moddle.create('bpmndi:BPMNPlane', {
      id: `${subProcessDefinition.id}_plane`,
      bpmnElement: subProcessDefinition,
    });
    plane.set('planeElement', []);
    diagram.set('plane', plane);

    if (!definitions.get('diagrams')) {
      definitions.set('diagrams', []);
    }
    definitions.get('diagrams').push(diagram);
  } else if (!diagram.plane?.get('planeElement')) {
    diagram.plane.set('planeElement', []);
  }

  return diagram;
}

/**
 * Collapsed subprocess on the main diagram; internal DI lives in a second BPMNDiagram (BPMN 2.0 §12).
 */
export function ensureSubProcessDiagram(moddle, definitions, subProcessDiagram, subProcessDefinition) {
  const diagram = getOrCreateSubProcessBpmnDiagram(moddle, definitions, subProcessDefinition);
  subProcessDiagram.set('isExpanded', false);
  return diagram.plane;
}

export function findSubProcessDiagram(
  subProcessDiagram,
  elementId,
  rootPlaneElements,
  definitions,
  subProcessDefinition,
) {
  const subprocessPlane = getSubProcessPlane(definitions, subProcessDefinition);
  if (subprocessPlane) {
    const match = subprocessPlane.get('planeElement').find(
      ({ bpmnElement }) => bpmnElement && bpmnElement.id === elementId,
    );
    if (match) {
      return match;
    }
  }

  return rootPlaneElements.find(
    ({ bpmnElement }) => bpmnElement && bpmnElement.id === elementId,
  );
}

function pullFromRootPlane(definitions, childDiagram) {
  const rootPlane = definitions?.diagrams?.[0]?.plane;
  if (!rootPlane?.get('planeElement')) {
    return;
  }
  const rootElements = rootPlane.get('planeElement');
  const rootIndex = rootElements.indexOf(childDiagram);
  if (rootIndex !== -1) {
    rootElements.splice(rootIndex, 1);
  }
}

export function addDiagramToSubProcessPlane(moddle, definitions, subProcessNode, childDiagram) {
  const plane = ensureSubProcessDiagram(
    moddle,
    definitions,
    subProcessNode.diagram,
    subProcessNode.definition,
  );
  pullFromRootPlane(definitions, childDiagram);
  const planeElements = plane.get('planeElement');
  if (!planeElements.includes(childDiagram)) {
    planeElements.push(childDiagram);
  }
}

function collectNestedModdleIds(subProcessDefinition, ids) {
  (subProcessDefinition.get('flowElements') || []).forEach((element) => {
    ids.add(element);
    if (element.$type === 'bpmn:SubProcess') {
      collectNestedModdleIds(element, ids);
    }
  });
  (subProcessDefinition.get('artifacts') || []).forEach((element) => ids.add(element));
}

/**
 * Removes subprocess children that were incorrectly registered on the process flowElements (e.g. via crown).
 */
export function dedupeProcessFlowElementsNestedInSubProcesses(definitions) {
  if (!definitions?.rootElements) {
    return;
  }

  definitions.rootElements
    .filter(({ $type }) => $type === 'bpmn:Process')
    .forEach((process) => {
      const nestedElements = new Set();
      (process.get('flowElements') || [])
        .filter(({ $type }) => $type === 'bpmn:SubProcess')
        .forEach((subProcess) => collectNestedModdleIds(subProcess, nestedElements));

      if (!nestedElements.size) {
        return;
      }

      process.set(
        'flowElements',
        (process.get('flowElements') || []).filter(
          (element) => element.$type === 'bpmn:SubProcess' || !nestedElements.has(element),
        ),
      );
      process.set(
        'artifacts',
        (process.get('artifacts') || []).filter((element) => !nestedElements.has(element)),
      );
    });
}

function collectSubProcessDefinitions(rootElements) {
  const subprocesses = [];

  const walkFlowElements = (flowElements) => {
    if (!flowElements) {
      return;
    }
    flowElements.forEach((element) => {
      if (element.$type === 'bpmn:SubProcess') {
        subprocesses.push(element);
        walkFlowElements(element.get('flowElements'));
      }
    });
  };

  rootElements
    .filter(({ $type }) => $type === 'bpmn:Process')
    .forEach((process) => walkFlowElements(process.get('flowElements')));

  return subprocesses;
}

function childDiagramIdsForSubProcess(subProcessDefinition) {
  const ids = new Set();
  const addIds = (items) => {
    if (!items) {
      return;
    }
    items.forEach((item) => ids.add(item.id));
  };
  addIds(subProcessDefinition.get('flowElements'));
  addIds(subProcessDefinition.get('artifacts'));
  return ids;
}

function getModdleFromDefinitions(definitions) {
  return definitions.$model
    || definitions.rootElements?.[0]?.$model
    || definitions.diagrams?.[0]?.$model;
}

/**
 * Moves subprocess child DI off the process diagram plane into dedicated BPMNDiagram entries.
 */
export function normalizeEmbeddedSubProcessDi(definitions) {
  if (!definitions?.diagrams?.[0]?.plane) {
    return;
  }

  const rootPlane = definitions.diagrams[0].plane;
  const rootPlaneElements = rootPlane.get('planeElement');
  if (!rootPlaneElements) {
    return;
  }

  const moddle = getModdleFromDefinitions(definitions);
  if (!moddle) {
    return;
  }

  const subprocessDefinitions = collectSubProcessDefinitions(definitions.rootElements);

  subprocessDefinitions.forEach((subProcessDefinition) => {
    const subShape = rootPlaneElements.find(
      (diagram) => diagram.bpmnElement === subProcessDefinition,
    );

    if (!subShape) {
      return;
    }

    subShape.set('isExpanded', false);

    const subprocessPlane = ensureSubProcessDiagram(
      moddle,
      definitions,
      subShape,
      subProcessDefinition,
    );
    const childIds = childDiagramIdsForSubProcess(subProcessDefinition);
    const toMove = rootPlaneElements.filter(
      (diagram) => diagram.bpmnElement && childIds.has(diagram.bpmnElement.id),
    );

    toMove.forEach((diagram) => {
      const rootIndex = rootPlaneElements.indexOf(diagram);
      if (rootIndex !== -1) {
        rootPlaneElements.splice(rootIndex, 1);
      }
      if (!subprocessPlane.get('planeElement').includes(diagram)) {
        subprocessPlane.get('planeElement').push(diagram);
      }
    });
  });
}
