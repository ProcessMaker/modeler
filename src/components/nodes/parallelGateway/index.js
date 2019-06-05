import component from './parallelGateway.vue';
import { gatewayDirection } from '../gateway/gatewayConfig';
import { configId } from '@/components/inspectors/configId';

export default {
  id: 'processmaker-modeler-parallel-gateway',
  component,
  bpmnType: 'bpmn:ParallelGateway',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/parallel-gateway.svg'),
  label: 'Parallel Gateway',
  definition(moddle, $t) {
    return moddle.create('bpmn:ParallelGateway', {
      name: $t('New Parallel Gateway'),
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
                helper: 'The id field should be unique across all elements in the diagram',
                name: configId.id,
                validation: configId.validation,
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
    },
  ],
};
