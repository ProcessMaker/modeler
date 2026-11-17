import store from '@/store';
import { isJSON } from 'lodash-contrib';
import { findSubProcessDiagram, addDiagramToSubProcessPlane } from './embeddedSubProcessDiagram';

export function loadEmbeddedSubProcessChildren({
  modeler,
  subProcessNode,
  moddle,
  nodeRegistry,
  planeElements,
  definitions,
}) {
  const subProcessDefinition = subProcessNode.definition;
  const existingChildren = store.getters.nodes.filter(
    (node) => node.subProcessContainer === subProcessDefinition,
  );
  const flowElements = subProcessDefinition.get('flowElements') || [];

  const loadDefinition = (definition, typeOverride = null) => {
    if (existingChildren.some(({ definition: def }) => def.id === definition.id)) {
      return;
    }

    const parser = modeler.getCustomParser(definition);
    if (!parser && !typeOverride) {
      return;
    }

    const config = definition.config && isJSON(definition.config)
      ? JSON.parse(definition.config)
      : {};
    const type = typeOverride || config?.processKey || parser(definition, moddle);

    if (!type || !nodeRegistry[type]) {
      return;
    }

    if (definition.$type === 'bpmn:SequenceFlow' && definition.get('name') == null) {
      definition.set('name', '');
    }

    let diagram = findSubProcessDiagram(
      subProcessNode.diagram,
      definition.id,
      planeElements,
      definitions,
      subProcessDefinition,
    );

    if (!diagram) {
      diagram = nodeRegistry[type].diagram(moddle);
      addDiagramToSubProcessPlane(moddle, definitions, subProcessNode, diagram);
    }

    const node = modeler.createNode(type, definition, diagram);
    node.subProcessContainer = subProcessDefinition;
    store.commit('addNode', node);
    existingChildren.push(node);
  };

  flowElements
    .filter(({ $type }) => $type !== 'bpmn:SequenceFlow')
    .forEach((definition) => loadDefinition(definition));

  flowElements
    .filter(({ $type }) => $type === 'bpmn:SequenceFlow')
    .forEach((definition) => {
      if (!modeler.hasSourceAndTarget(definition)) {
        return;
      }
      loadDefinition(definition, 'processmaker-modeler-sequence-flow');
    });
}
