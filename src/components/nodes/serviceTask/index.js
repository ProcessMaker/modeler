import taskConfig from '@/components/nodes/task';

export default {
  ...taskConfig,
  id: 'processmaker-modeler-service-task',
  bpmnType: ['bpmn:ServiceTask', 'bpmn:SendTask', 'bpmn:ReceiveTask'],
  control: false,
  label: 'Service Task',
  definition(moddle) {
    return moddle.create('bpmn:ServiceTask', {
      name: 'New Service Task',
    });
  },
  inspectorConfig: [
    {
      name: 'ServiceTask',
      items: [
        // {
        //   component: 'FormText',
        //   config: {
        //     label: 'Service Task',
        //   },
        // },
      ],
    },
  ],
};
