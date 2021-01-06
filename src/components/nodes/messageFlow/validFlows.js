export function isValidTargetType(targetBpmnType) {
  return [
    'bpmn:Task',
    'bpmn:ScriptTask',
    'bpmn:ManualTask',
    'bpmn:CallActivity',
    'bpmn:ServiceTask',
    'bpmn:IntermediateCatchEvent',
    'bpmn:Participant',
    'bpmn:StartEvent',
    'bpmn:BoundaryEvent',
  ].some(type => type === targetBpmnType);
}

export function targetIsValidStartEventType(targetNode) {
  if (!targetNode.isBpmnType('bpmn:StartEvent')) {
    return true;
  }

  return targetNode.isType('processmaker-modeler-message-start-event');
}
