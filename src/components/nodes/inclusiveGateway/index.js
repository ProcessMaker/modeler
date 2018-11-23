import component from './inclusiveGateway.vue';

export default {
  id: 'processmaker-modeler-inclusive-gateway',
  component: component,
  bpmnType: 'bpmn:InclusiveGateway',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/inclusive-gateway.svg'),
  label: 'Inclusive Gateway',
  definition: function(moddle) {
    return moddle.create('bpmn:InclusiveGateway', {
      name: 'New Inclusive Gateway',
    });
  },
  diagram: function(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 42,
        width: 42,
      }),
    });
  },
  inspectorHandler: function(value, definition, component) {
    // Go through each property and rebind it to our data
    for (var key in value) {
      // Only change if the value is different
      if (definition[key] != value[key]) {
        definition[key] = value[key];
        definition.set('name', value.name);
      }
    }
    component.updateShape();
  },
  inspectorConfig: [
    {
      name: 'Inclusive Gateway',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Inclusive Gateway',
            fontSize: '2em',
          },
        },
        {
          component: 'FormInput',
          config: {
            label: 'Identifier',
            helper: 'The id field should be unique across all elements in the diagram',
            name: 'id',
          },
        },
        {
          component: 'FormInput',
          config: {
            label: 'Name',
            helper: 'The Name of the Gateway',
            name: 'name',
          },
        },
      ],
    },
  ],
};
