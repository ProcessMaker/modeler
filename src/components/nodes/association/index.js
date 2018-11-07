import component from './association.vue';

export default {
  id: 'processmaker-modeler-association',
  component: component,
  bpmnType: 'bpmn:Association',
  control: false,
  inspectorHandler: function(value, definition, component) {
    // Go through each property and rebind it to our data
    for (var key in value) {
      // Only change if the value is different
      if (definition[key] != value[key]) {
        definition[key] = value[key];
      }
    }
    component.updateShape();
  },
  inspectorConfig: [
    {
      name: 'Task',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Task',
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
            helper: 'The Name of the Association',
            name: 'name',
          },
        },
        {
          component: 'FormInput',
          config: {
            label: 'Expression',
            helper: 'Shows relationships between artifacts and flow objects.',
            name: 'conditionExpression.body',
          },
        },
      ],
    },
  ],
};
