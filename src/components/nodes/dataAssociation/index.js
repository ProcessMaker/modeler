import component from './dataAssociation.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';

export const id  = 'processmaker-modeler-data-association';

export default {
  id,
  component,
  bpmnType: 'bpmn:DataAssociation',
  control: false,
  definition(moddle) {
    return moddle.create('bpmn:DataAssociation', {
      dataAssociationDirection: 'None',
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
            name: 'inspector-accordion',
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
                name: 'dataAssociationDirection',
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
