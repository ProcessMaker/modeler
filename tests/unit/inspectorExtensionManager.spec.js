import InspectorExtensionManager from '@/components/InspectorExtensionManager';

describe('Inspector Extension Manager', function() {
  let node;
  let config;

  beforeEach(() => {
    node = {
      inspectorConfig: [{
        items: [
          {
            id: 1,
          },
          {
            id: 2,
          },
        ],
      }],
    };
    config = {
      id: 5,
      container: true,
      name: 'advanced',
    };
  });

  it('should always sort the advanced accordion to the end when the config is a container', function() {
    InspectorExtensionManager.registerInspectorExtension(node, config);

    const [lastItem] = node.inspectorConfig[0].items.slice(-1);
    expect(lastItem).toBe(config);
  });

  it('should always sort the advanced accordion to the end when the config is not a container', function() {
    delete config.container;
    const items = node.inspectorConfig[0].items;
    node.inspectorConfig[0].items = [{ items }];

    InspectorExtensionManager.registerInspectorExtension(node, config);

    const [lastItem] = node.inspectorConfig[0].items[0].items.slice(-1);
    expect(lastItem).toBe(config);
  });

  it('should update items that have the same id', function() {
    config.id = 1;

    InspectorExtensionManager.registerInspectorExtension(node, config);

    const items = node.inspectorConfig[0].items;
    const [lastItem] = node.inspectorConfig[0].items.slice(-1);
    expect(items.length).toBe(2);
    expect(lastItem).toBe(config);
  });

  it('should only move advanced types to the end', function() {
    const secondConfig = {
      id: 6,
      name: 'Not advanced',
      container: true,
    };

    InspectorExtensionManager.registerInspectorExtension(node, config);
    InspectorExtensionManager.registerInspectorExtension(node, secondConfig);

    const [lastItem] = node.inspectorConfig[0].items.slice(-1);
    expect(lastItem).toBe(config);
  });
});
