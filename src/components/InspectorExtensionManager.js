export default class InspectorExtensionManager {
  static registerInspectorExtension(node, config) {
    const inspectorItems = this.getInspectorItems(node, config);
    this.addInspectorItem(inspectorItems, config);
    inspectorItems.sort(this.moveAdvancedAccordionToBottom);
  }

  static moveAdvancedAccordionToBottom(inspectorItemA, inspectorItemB) {
    const isAdvancedAccordion = (inspectorItem) => inspectorItem.name === 'advanced';
    if (isAdvancedAccordion(inspectorItemA)) {
      return 1;
    }

    if (isAdvancedAccordion(inspectorItemB)) {
      return -1;
    }

    return 0;
  }

  static addInspectorItem(inspectorItems, config) {
    const nodeIndex = inspectorItems.findIndex(item => {
      return config.id && config.id === item.id;
    });
    if (nodeIndex === -1) {
      inspectorItems.push(config);
      return;
    }
    inspectorItems[nodeIndex] = config;
  }

  static getInspectorItems(node, config) {
    if (typeof config.container !== 'undefined') {
      return node.inspectorConfig[0].items;
    }
    return node.inspectorConfig[0].items[0].items;
  }
}
