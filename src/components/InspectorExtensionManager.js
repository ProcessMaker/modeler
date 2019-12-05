export default function registerInspectorExtension(node, config) {
  const inspectorItems = getInspectorItems(node, config);
  addInspectorItem(inspectorItems, config);
  inspectorItems.sort(moveAdvancedAccordionToBottom);
}

function moveAdvancedAccordionToBottom(inspectorItemA, inspectorItemB) {
  const isAdvancedAccordion = (inspectorItem) => inspectorItem.label === 'Advanced';
  if (isAdvancedAccordion(inspectorItemA)) {
    return 1;
  }

  if (isAdvancedAccordion(inspectorItemB)) {
    return -1;
  }

  return 0;
}

function addInspectorItem(inspectorItems, config) {
  const nodeIndex = inspectorItems.findIndex(item => {
    return config.id && config.id === item.id;
  });
  if (nodeIndex === -1) {
    inspectorItems.push(config);
    return;
  }
  inspectorItems[nodeIndex] = config;
}

function getInspectorItems(node, config) {
  if (typeof config.container !== 'undefined') {
    return node.inspectorConfig[0].items;
  }
  return node.inspectorConfig[0].items[0].items;
}
