import component from './parallelGateway.vue';
import { gatewayDirection } from '../gateway/gatewayConfig';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';

export default {
  id: 'processmaker-modeler-parallel-gateway',
  component,
  bpmnType: 'bpmn:ParallelGateway',
  control: false,
  category: 'BPMN',
  label: 'Parallel Gateway',
  definition(moddle, $t) {
    return moddle.create('bpmn:ParallelGateway', {
      name: $t('Parallel Gateway'),
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
            label: 'Properties',
            icon: 'cog',
            name: 'inspector-accordion-parallel-gateway-config',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
          ],
        },
        documentationAccordionConfig,
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: false,
            label: 'Advanced',
            icon: 'cogs',
            name: 'inspector-accordion-parallel-gateway-direction',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
            {
              component: 'FormSelect',
              config: {
                label: 'Direction',
                helper: 'Select the direction of workflow for this element',
                name: 'gatewayDirection',
                options: [
                  { value: gatewayDirection.diverging, content: 'Diverging' },
                  { value: gatewayDirection.converging, content: 'Converging' },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
