export const getBoundaryEventData = (node) => {
  const control = {
    bpmnType: node.diagram.$type,
    id: node.diagram.id,
    type: node.type,
    attachedToRef: node.definition.get('attachedToRef'),
  };

  const eventDefinition = node.definition.get('eventDefinitions')[0];
  const eventDefinitionType = Object.keys(eventDefinition).reduce((acc, key) => {
    if (key.startsWith('time')) {
      acc[key] = eventDefinition[key];
    }
    return acc;
  }, {});

  const type = Object.keys(eventDefinitionType)[0];

  return {
    x: node.diagram.bounds.x,
    y: node.diagram.bounds.y,
    height: node.diagram.bounds.height,
    width: node.diagram.bounds.width,
    attachedToRefId: node.definition.get('attachedToRef')?.id,
    control,
    type: node.type,
    id: node.definition.id,
    color: node.definition.get('color'),
    cancelActivity: node.definition.get('cancelActivity'),
    eventTimerDefinition: {
      type,
      body: eventDefinitionType[type]?.body,
    },
  };
};
