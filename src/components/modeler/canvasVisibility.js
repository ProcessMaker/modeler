export function isNodeVisibleOnCanvas(node, activeSubProcessNode) {
  if (!node) {
    return false;
  }
  if (activeSubProcessNode) {
    return node.subProcessContainer === activeSubProcessNode.definition;
  }
  return !node.subProcessContainer;
}

export function isElementVisibleOnCanvas(element, paper, activeSubProcessNode) {
  if (!element) {
    return false;
  }
  const view = paper?.findViewByModel(element);
  if (view?.el?.style?.display === 'none') {
    return false;
  }
  const node = element.component?.node;
  if (!node) {
    if (typeof element.isLink === 'function' && element.isLink()) {
      const sourceEl = element.getSourceElement();
      const targetEl = element.getTargetElement();
      const sourceOk = !sourceEl || isElementVisibleOnCanvas(sourceEl, paper, activeSubProcessNode);
      const targetOk = !targetEl || isElementVisibleOnCanvas(targetEl, paper, activeSubProcessNode);
      return sourceOk && targetOk;
    }
    return true;
  }
  return isNodeVisibleOnCanvas(node, activeSubProcessNode);
}

export function findTopVisibleModelAtPoint(graph, paper, point, activeSubProcessNode) {
  return graph
    .findModelsFromPoint(point)
    .filter((shape) => isElementVisibleOnCanvas(shape, paper, activeSubProcessNode))
    .sort((shape1, shape2) => shape2.get('z') - shape1.get('z'))[0];
}
