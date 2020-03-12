import taskConfig from '@/components/nodes/task';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';

export default {
  ...taskConfig,
  id: 'processmaker-modeler-service-task',
  bpmnType: ['bpmn:ServiceTask', 'bpmn:SendTask', 'bpmn:ReceiveTask'],
  control: false,
  label: 'Service Task',
  definition(moddle, $t) {
    return moddle.create('bpmn:ServiceTask', {
      name: $t('Service Task'),
      documentation: [moddle.create('bpmn:Documentation', { text: '' })],
    });
  },
  inspectorConfig: [
    {
      name: 'Service Task',
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
              config: nameConfigSettings,
            },
          ],
        },
        advancedAccordionConfig,
      ],
    },
  ],
};
