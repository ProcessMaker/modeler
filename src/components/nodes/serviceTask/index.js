import taskConfig from '@/components/nodes/task';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';

export default {
  ...taskConfig,
  id: 'processmaker-modeler-service-task',
  bpmnType: ['bpmn:ServiceTask', 'bpmn:SendTask', 'bpmn:ReceiveTask'],
  control: false,
  label: 'Service Task',
  definition(moddle, $t) {
    return moddle.create('bpmn:ServiceTask', {
      name: $t('Service Task'),
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
            name: 'inspector-accordion-service-task',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
          ],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
};
