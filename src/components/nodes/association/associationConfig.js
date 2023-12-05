export const id = 'processmaker-modeler-association';

export const bpmnType = 'bpmn:Association';

export const direction = { none: 'None', one: 'One', both: 'Both' };

export function definition(moddle) {
  return moddle.create(bpmnType, {
    associationDirection: direction.none,
    targetRef: { x: undefined, y: undefined },
  });
}

export function diagram(moddle) {
  return moddle.create('bpmndi:BPMNEdge');
}
