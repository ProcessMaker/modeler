import component from './parallelGateway.vue';
import { gatewayDirection } from '../gateway/gatewayConfig';

export default {
  id: 'processmaker-modeler-parallel-gateway',
  component,
  bpmnType: 'bpmn:ParallelGateway',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/parallel-gateway.svg'),
  label: 'Parallel Gateway',
  definition(moddle) {
    return moddle.create('bpmn:ParallelGateway', {
      name: 'New Parallel Gateway',
      gatewayDirection: gatewayDirection.diverging,
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 36,
        width: 36,
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
        {
          component: 'FormSelect',
          config: {
            label: 'Direction',
            helper: 'Select direction of gateway',
            name: 'gatewayDirection',
            options: [
              { value: gatewayDirection.diverging , content: 'Diverging' },
              { value: gatewayDirection.converging , content: 'Converging' },
            ],
          },
        },
      ],
    },
  ],
};
