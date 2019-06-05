import component from './eventBasedGateway.vue';
import { configId } from '@/components/inspectors/configId';

export default {
  id: 'processmaker-modeler-event-based-gateway',
  component,
  bpmnType: 'bpmn:EventBasedGateway',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/event-based-gateway.svg'),
  label: 'Event-based Gateway',
  definition(moddle, $t) {
    return moddle.create('bpmn:EventBasedGateway', {
      name: $t('New Event-Based Gateway'),
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
      name: 'Event-based Gateway',
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
                helper: configId.helper,
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
          ],
        },
      ],
    },
  ],
};
