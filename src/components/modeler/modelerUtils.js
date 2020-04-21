import {
  defaultEndNames,
  defaultGatewayNames,
  defaultIntermediateNames,
  defaultStartNames,
  defaultTaskNames,
} from '@/components/nodes/defaultNames';

function getDefaultNames(node) {
  if (node.isStartEvent()) {
    return defaultStartNames;
  }
  if (node.isTask()) {
    return defaultTaskNames;
  }
  if (node.isGateway()) {
    return defaultGatewayNames;
  }
  if (node.isIntermediateEvent()) {
    return defaultIntermediateNames;
  }
  if (node.isEndEvent()) {
    return defaultEndNames;
  }
  return null;
}

export function keepOriginalName(node) {
  if (!node) {
    return false;
  }
  const defaultNames = getDefaultNames(node);
  return defaultNames ? !Object.values(defaultNames).includes(node.definition.name) : true;
}

export function getAssociationFlowsForNode(node, processes) {
  return processes
    .reduce((artifacts, process) => artifacts.concat(process.get('artifacts')), [])
    .filter(artifact => artifact.$type === 'bpmn:Association')
    .filter(association => association.targetRef === node.definition);
}
