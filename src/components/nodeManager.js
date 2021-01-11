import { bpmnType as dataOutputAssociationType } from '@/components/nodes/dataOutputAssociation/config';
import { bpmnType as dataInputAssociationType } from '@/components/nodes/dataInputAssociation/config';

export function addNodeToProcess(node, targetProcess) {
  const ignoredNodes = (node) => {
    return node.isBpmnType('bpmn:MessageFlow', dataOutputAssociationType, dataInputAssociationType)
      || node.isType('processmaker-modeler-pool');
  };

  if (ignoredNodes(node)) {
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
