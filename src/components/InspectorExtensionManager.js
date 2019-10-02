export default class InspectorExtensionManager {
  static registerInspectorExtension(node, config) {
    const inspectorItems = this.getInspectorItems(node, config);
    this.addInspectorItem(inspectorItems, config);
    inspectorItems.sort(this.moveAdvancedAccordionToBottom);
  }

  static isAdvancedAccordion(accordion) {
    return accordion.name === 'advanced';
  }

  static moveAdvancedAccordionToBottom(accordionA, accordionB) {
    if (this.isAdvancedAccordion(accordionA)) {
      return 1;
    }

    if (this.isAdvancedAccordion(accordionB)) {
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
    let inspectorItems = node.inspectorConfig[0].items;
    if (typeof config.container === 'undefined') {
      inspectorItems = inspectorItems[0].items;
    }
    return inspectorItems;
  }
}
