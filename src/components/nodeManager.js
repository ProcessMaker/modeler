export function addNodeToProcess(node, targetProcess) {
  if (node.isType('processmaker-modeler-pool') || node.isBpmnType('bpmn:MessageFlow')) {
    return;
  }

  if (node.isType('processmaker-modeler-lane')) {
    targetProcess
      .get('laneSets')[0]
      .get('lanes')
      .push(node.definition);
    return;
  }

  let target = 'flowElements';
  if (node.isBpmnType('bpmn:TextAnnotation') || node.isBpmnType('bpmn:Association')) {
    target = 'artifacts';
  }

  targetProcess.get(target).push(node.definition);
}
