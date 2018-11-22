import component from './parallelGateway.vue';

export default {
  id: 'processmaker-modeler-parallelGateway-gateway',
  component: component,
  bpmnType: 'bpmn:ParallelGateway',
  control: true,
  category: 'BPMN',
  icon: require('../../../assets/toolpanel/parallel-gateway.svg'),
  label: 'Parallel Gateway',
  definition: function(moddle) {
    return moddle.create('bpmn:ParallelGateway', {
      name: 'New Parallel Gateway',
      gatewayDirection: 'Diverging',
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
        definition.set('gatewayDirection', value.gatewayDirection);
      }
    }
    component.updateShape();
  },
  inspectorConfig: [
    {
      name: 'Parallel Gateway',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Parallel Gateway',
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
        {
          component: 'FormSelect',
          config: {
            label: 'Direction',
            helper: 'The direction of the gateway',
            name: 'gatewayDirection',
            options: [
              {
                value: 'Diverging',
                content: 'Diverging',
              },
              {
                value: 'Converging',
                content: 'Converging',
              },
            ],
          },
        },
      ],
    },
  ],
};
