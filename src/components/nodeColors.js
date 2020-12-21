import tinycolor from 'tinycolor2';

export const baseNodeColors = [
  '#357bf6',
  '#4ba0b5',
  '#53a451',
  '#6d747c',
  '#f7b84b',
  '#ff8628',
  '#cc444a',
];

export const validNodeColor = '#dffdd0';
export const invalidNodeColor = '#fae0e6';

export const defaultNodeColor = '#fff';
export const defaultNodeColorStroke = '#000';

export const startColor = '#edfffc';
export const startColorStroke = '#00bf9c';

export const intermediateColor = '#fff4d1';
export const intermediateColorStroke = '#fbbe02';

export const endColor = '#fff1f2';
export const endColorStroke = '#ed4757';

export const poolColor = '#f7f7f7';

export function getDefaultNodeColors(node, color) {
  if (color) {
    return { fill: tinycolor(color).lighten(35).toHex8String(), stroke: color };
  }

  if (node.isBpmnType('bpmn:StartEvent')) {
    return { fill: startColor, stroke: startColorStroke };
  }

  if (node.isBpmnType('bpmn:IntermediateEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent')) {
    return { fill: intermediateColor, stroke: intermediateColorStroke };
  }

  if (node.isBpmnType('bpmn:EndEvent')) {
    return { fill: endColor, stroke: endColorStroke };
  }

  if (node.isBpmnType('bpmn:Participant', 'bpmn:Lane')) {
    return { fill: poolColor, stroke: defaultNodeColorStroke };
  }

  return { fill: defaultNodeColor, stroke: defaultNodeColorStroke };
}

export function setShapeColor(shape, fill, stroke) {
  if (shape.component.node.isType('processmaker-modeler-text-annotation')) {
    shape.attr('label/fill', stroke);
    shape.attr('body/stroke', stroke);
    return;
  }

  if (shape.attr('body')) {
    shape.attr('body/fill', fill);
    shape.attr('body/stroke', stroke);
  }

  if (shape.attr('body2')) {
    shape.attr('body2/fill', fill);
    shape.attr('body2/stroke', stroke);
  }

  if (shape.attr('line')) {
    shape.attr('line/stroke', stroke);
  }

  if (shape.attr('polyline')) {
    shape.attr('polyline/fill', fill);
    shape.attr('polyline/stroke', stroke);
  }

  if (shape.attr('label')) {
    shape.attr('label/fill', stroke);
  }
}

export function getDefaultIconColor(node) {
  if (node.isBpmnType('bpmn:StartEvent')) {
    return startColorStroke;
  }

  if (node.isBpmnType('bpmn:IntermediateEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent')) {
    return intermediateColorStroke;
  }

  if (node.isBpmnType('bpmn:EndEvent')) {
    return endColorStroke;
  }

  if (node.isBpmnType('bpmn:ExclusiveGateway', 'bpmn:ParallelGateway', 'bpmn:InclusiveGateway', 'bpmn:EventBasedGateway', 'bpmn:BoundaryEvent')) {
    return '#000';
  }

  return '#788793';
}
