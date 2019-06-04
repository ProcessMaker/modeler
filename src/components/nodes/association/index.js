import component from './association.vue';
import { direction } from './associationConfig';

export const id  = 'processmaker-modeler-association';

export default {
  id,
  component,
  bpmnType: 'bpmn:Association',
  control: false,
  definition(moddle) {
    return moddle.create('bpmn:Association', {
      associationDirection: `${ direction.none }`,
    });
  },
  inspectorConfig: [
    {
      name: 'Association',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'confifuration',
          },
          items: [
            {
              component: 'FormInput',
              config: {
                label: 'Identifier',
                helper: 'The id field should be unique across all elements in the diagram',
                name: 'id',
                validation: ['required', 'regex:/^[a-zA-Z][^\\s][a-zA-Z0-9_]+$/'],
              },
            },
            {
              component: 'FormSelect',
              config: {
                label: 'Direction',
                helper: 'Select Direction',
                name: 'associationDirection',
                options: [
                  { value: `${ direction.none }`, content: 'None' },
                  { value: `${ direction.one }`, content: 'One' },
                  { value: `${ direction.both }`, content: 'Both' },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
