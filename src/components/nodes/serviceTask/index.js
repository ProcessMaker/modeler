import taskConfig from '@/components/nodes/task';

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
      name: 'ServiceTask',
      items: [
      ],
    },
  ],
};
