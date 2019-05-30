import taskConfig from '@/components/nodes/task';
import i18next from 'i18next';

export default {
  ...taskConfig,
  id: 'processmaker-modeler-service-task',
  bpmnType: ['bpmn:ServiceTask', 'bpmn:SendTask', 'bpmn:ReceiveTask'],
  control: false,
  label: 'Service Task',
  definition(moddle) {
    return moddle.create('bpmn:ServiceTask', {
      name: i18next.t('New Service Task'),
    });
  },
  inspectorConfig: [
    {
      name: 'ServiceTask',
      items: [
      ],
    },
  ],
};
