import component from './messageFlow.vue';
import { configId } from '@/components/inspectors/configId';

export const id = 'processmaker-modeler-message-flow';

export default {
  id,
  component,
  bpmnType: 'bpmn:MessageFlow',
  control: false,
  definition(moddle) {
    return moddle.create('bpmn:MessageFlow', { name: '' });
  },
  inspectorConfig: [
    {
      name: 'Message Flow',
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
                helper: configId.helper,
                name: configId.id,
                validation: configId.validation,
              },
            },
            {
              component: 'FormInput',
              config: {
                label: 'Name',
                helper: 'The Name of the Message Flow',
                name: 'name',
              },
            },
          ],
        },
      ],
    },
  ],
};
