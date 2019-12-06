export default function registerInspectorExtension(node, config) {
  const inspectorItems = getInspectorItems(node, config);
  addInspectorItem(inspectorItems, config);
  node.inspectorConfig[0].items.sort(moveAdvancedAccordionToBottom);
}

function moveAdvancedAccordionToBottom(accordionA, accordionB) {
  if (isAdvancedAccordion(accordionA)) {
    return 1;
  }

  if (isAdvancedAccordion(accordionB)) {
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

function isAdvancedAccordion(accordion) {
  return accordion.config && accordion.config.label === 'Advanced';
}
