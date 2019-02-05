import component from './association.vue';

export const id  = 'processmaker-modeler-association';

export default {
  id,
  component,
  bpmnType: 'bpmn:Association',
  control: false,
  definition(moddle) {
    return moddle.create('bpmn:Association', {
      associationDirection: 'none',
    });
  },
  inspectorConfig: [
    {
      name: 'Association',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Association',
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
          component: 'FormSelect',
          config: {
            label: 'Direction',
            helper: 'Select Direction',
            name: 'associationDirection',
            options: [
              { value: 'none', content: 'None' },
              { value: 'one', content: 'One' },
              { value: 'both', content: 'Both' },
            ],
          },
        },
      ],
    },
  ],
};
