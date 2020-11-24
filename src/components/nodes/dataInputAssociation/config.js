export const id  = 'processmaker-modeler-data-input-association';

export const bpmnType = 'bpmn:DataInputAssociation';

export function definition(moddle) {
  return moddle.create('bpmn:DataInputAssociation', {
    targetRef: { x: undefined, y: undefined },
  });
}

export function diagram(moddle) {
  return moddle.create('bpmndi:BPMNEdge');
}
