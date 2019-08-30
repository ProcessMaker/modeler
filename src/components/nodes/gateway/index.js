import component from './gateway.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';

export default {
  id: 'processmaker-modeler-gateway',
  component,
  bpmnType: ['bpmn:ExclusiveGateway', 'bpmn:ParallelGateway', 'bpmn:InclusiveGateway'],
  control: true,
  category: 'BPMN',
  label: 'Gateway',
  definition(moddle, $t) {
    return moddle.create('bpmn:Gateway', {
      name: $t('New Gateway'),
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
            name: 'configuration',
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
      ],
    },
  ],
};
