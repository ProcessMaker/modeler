const validBoundaryEventTargets = [
  'bpmn:Task',
  'bpmn:ScriptTask',
  'bpmn:ServiceTask',
  'bpmn:SendTask',
  'bpmn:ReceiveTask',
  'bpmn:UserTask',
  'bpmn:GlobalTask',
  'bpmn:ManualTask',
  'bpmn:CallActivity',
];

export default function isValidBoundaryEventTarget(component) {
  return component && validBoundaryEventTargets.some(targetType => component.node.isBpmnType(targetType));
}
