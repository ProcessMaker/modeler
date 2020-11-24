export const id = 'processmaker-modeler-data-output-association';

export const bpmnType = ['bpmn:DataAssociation', 'bpmn:DataOutputAssociation', 'bpmn:DataInputAssociation'];

export function definition(moddle) {
  return moddle.create('bpmn:DataOutputAssociation', {
    targetRef: { x: undefined, y: undefined },
  });
}

export function diagram(moddle) {
  return moddle.create('bpmndi:BPMNEdge');
}
