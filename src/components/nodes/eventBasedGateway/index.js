import component from './eventBasedGateway.vue';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';

export default {
  id: 'processmaker-modeler-event-based-gateway',
  component,
  bpmnType: 'bpmn:EventBasedGateway',
  control: false,
  category: 'BPMN',
  label: 'Event-Based Gateway',
  definition(moddle, $t) {
    return moddle.create('bpmn:EventBasedGateway', {
      name: $t('Event-Based Gateway'),
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
      name: 'Event-Based Gateway',
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
          ],
        },
        advancedAccordionConfig,
      ],
    },
  ],
};
