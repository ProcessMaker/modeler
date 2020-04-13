import registerInspectorExtension from '@/components/InspectorExtensionManager';

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
      name: 'inspector-accordion',
      config: {
        label: 'Advanced',
      },
    };
  });

  it('should always sort the advanced accordion to the end when the config is a container', function() {
    registerInspectorExtension(node, config);
    registerInspectorExtension(node, {
      id: 'no-advanced-accordion',
      container: true,
      config: {
        label: 'Non-advanced',
      },
    });

    const [lastItem] = node.inspectorConfig[0].items.slice(-1);
    expect(lastItem).toBe(config);
  });

  it('should update items that have the same id', function() {
    config.id = 1;

    registerInspectorExtension(node, config);

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

    registerInspectorExtension(node, config);
    registerInspectorExtension(node, secondConfig);

    const [lastItem] = node.inspectorConfig[0].items.slice(-1);
    expect(lastItem).toBe(config);
  });

  it('should be possible to replace a field by name', function() {
    registerInspectorExtension(node, {
      container: true,
      config: {
        label: 'First',
        name: 'byName',
      },
    });
    registerInspectorExtension(node, {
      container: true,
      config: {
        label: 'Second',
        name: 'byName',
      },
    });

    const [lastItem] = node.inspectorConfig[0].items.splice(-1);
    expect(lastItem.config.label).toBe('Second');
  });

  it('should be possible to add a field to an existing accordion', function() {
    registerInspectorExtension(node, {
      id: 5,
      container: true,
      config: {
        label: 'Advanced',
        name: 'custom-accordion',
      },
      items: [
        {
          id: 5,
        },
      ],
    });
    const newField = {
      config: {
        label: 'New Field',
        name: 'field',
      },
    };
    registerInspectorExtension(node, newField, 'custom-accordion');

    const [lastItem] = node.inspectorConfig[0].items.splice(-1);
    expect(lastItem.items[0].id).toBe(5);
    expect(lastItem.items[1]).toBe(newField);
  });
});
