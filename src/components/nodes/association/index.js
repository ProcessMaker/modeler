import component from './association.vue';
import { direction } from './associationConfig';
import idConfigSettings from '@/components/inspectors/idConfigSettings';

export const id  = 'processmaker-modeler-association';

export default {
  id,
  component,
  bpmnType: 'bpmn:Association',
  control: false,
  definition(moddle) {
    return moddle.create('bpmn:Association', {
      associationDirection: `${direction.none}`,
    });
  },
  inspectorConfig: [
    {
      name: 'Data Association',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'inspector-accordion-association',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
            {
              component: 'FormSelect',
              config: {
                label: 'Direction',
                helper: 'Select Direction',
                name: 'associationDirection',
                options: [
                  { value: `${direction.none}`, content: 'None' },
                  { value: `${direction.one}`, content: 'One' },
                  { value: `${direction.both}`, content: 'Both' },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
