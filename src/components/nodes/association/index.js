import component from './association.vue';

export default {
  id: 'processmaker-modeler-association',
  component,
  bpmnType: 'bpmn:Association',
  control: false,
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
