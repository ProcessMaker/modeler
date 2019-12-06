import component from './parallelGateway.vue';
import { gatewayDirection } from '../gateway/gatewayConfig';
import idConfigSettings from '@/components/inspectors/idConfigSettings';

export default {
  id: 'processmaker-modeler-parallel-gateway',
  component,
  bpmnType: 'bpmn:ParallelGateway',
  control: false,
  category: 'BPMN',
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
            name: 'inspector-accordion',
          },
          items: [
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
                  { value: gatewayDirection.diverging, content: 'Diverging' },
                  { value: gatewayDirection.converging, content: 'Converging' },
                ],
              },
            },
          ],
        },
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: false,
            label: 'Advanced',
            icon: 'cogs',
            name: 'inspector-accordion',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
          ],
        },
      ],
    },
  ],
};
