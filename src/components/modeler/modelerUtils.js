import {
  defaultStartNames,
  defaultEndNames,
  defaultTaskNames,
  defaultGatewayNames,
  defaultIntermediateNames,
} from '@/components/nodes/defaultNames';

function getDefaultNames(node) {
  if (node.isStartGroup()) {
    return defaultStartNames;
  }
  if (node.isTaskGroup()) {
    return defaultTaskNames;
  }
  if (node.isGatewayGroup()) {
    return defaultGatewayNames;
  }
  if (node.isIntermediateGroup()) {
    return defaultIntermediateNames;
  }
  if (node.isEndGroup()) {
    return defaultEndNames;
  }
  return null;
}

export function shouldSetDefaultName(node) {
  if (!node) {
    return false;
  }
  const defaultNames = getDefaultNames(node);
  return defaultNames ? !Object.values(defaultNames).includes(node.definition.name) : false;
}
