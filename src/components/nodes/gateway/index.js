import component from './gateway.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';

export default {
  id: 'processmaker-modeler-gateway',
  component,
  bpmnType: ['bpmn:ExclusiveGateway', 'bpmn:ParallelGateway', 'bpmn:InclusiveGateway'],
  control: false,
  category: 'BPMN',
  label: 'Gateway',
  definition(moddle, $t) {
    return moddle.create('bpmn:Gateway', {
      name: $t('Gateway'),
      documentation: [moddle.create('bpmn:Documentation', { text: '' })],
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
      name: 'Gateway',
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
              config: idConfigSettings,
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
        advancedAccordionConfig,
      ],
    },
  ],
};
