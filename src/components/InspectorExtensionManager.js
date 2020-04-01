export default function registerInspectorExtension(node, config, ownerName) {
  const inspectorItems = getInspectorItems(node, config, ownerName);
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
    const isAFieldWithSameName = !config.container && config.config && item.config && config.config.name && config.config.name === item.config.name;
    return (config.id && config.id === item.id) || isAFieldWithSameName;
  });
  if (nodeIndex === -1) {
    inspectorItems.push(config);
    return;
  }
  inspectorItems[nodeIndex] = config;
}

function getInspectorItems(node, config, ownerName) {
  if (typeof config.container !== 'undefined') {
    return node.inspectorConfig[0].items;
  }
  if (ownerName) {
    node = node.inspectorConfig[0];
    ownerName.split('.').forEach(name => {
      node = node && node.items.find(node => node.config && node.config.name === name);
    });
    return node ? node.items : null;
  }
  return node.inspectorConfig[0].items[0].items;
}

function isAdvancedAccordion(accordion) {
  return accordion.config && accordion.config.label === 'Advanced';
}
