import component from './parallelGateway.vue';

export default {
  id: 'processmaker-modeler-parallelGateway-gateway',
  component,
  bpmnType: 'bpmn:ParallelGateway',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/parallel-gateway.svg'),
  label: 'Parallel Gateway',
  definition(moddle) {
    return moddle.create('bpmn:ParallelGateway', {
      name: 'New Parallel Gateway',
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 42,
        width: 42,
      }),
    });
  },
  inspectorConfig: [
    {
      name: 'Parallel Gateway',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Parallel Gateway',
            fontSize: '2em',
          },
        },
        {
          component: 'FormInput',
          config: {
            label: 'Identifier',
            helper: 'The id field should be unique across all elements in the diagram',
            name: 'id',
          },
        },
        {
          component: 'FormInput',
          config: {
            label: 'Name',
            helper: 'The Name of the Gateway',
            name: 'name',
          },
        },
      ],
    },
  ],
};
