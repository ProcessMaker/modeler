import component from './messageFlow.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';

export const id = 'processmaker-modeler-message-flow';

export default {
  id,
  component,
  bpmnType: 'bpmn:MessageFlow',
  control: false,
  definition(moddle, $t) {
    return moddle.create('bpmn:MessageFlow', { name: $t('Message Flow') });
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
            name: 'configuration',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
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
