import component from './eventBasedGateway.vue';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import defaultNames from '@/components/nodes/gateway/defaultNames';

const id = 'processmaker-modeler-event-based-gateway';

export default {
  id,
  component,
  bpmnType: 'bpmn:EventBasedGateway',
  control: false,
  category: 'BPMN',
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:EventBasedGateway', {
      name: $t(defaultNames[id]),
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
      name: defaultNames[id],
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'inspector-accordion-event-based-gateway',
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
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
};
