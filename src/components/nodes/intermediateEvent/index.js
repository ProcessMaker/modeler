import component from '@/components/nodes/intermediateEvent/intermediateEvent.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';

export default {
  id: 'processmaker-modeler-intermediate-event',
  component,
  bpmnType: 'bpmn:IntermediateEvent',
  control: true,
  category: 'BPMN',
  label: 'Intermediate Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateEvent', {
      name: $t('Intermediate Event'),
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 36,
        width: 36,
        x: null,
        y: null,
      }),
    });
  },
  inspectorConfig: [
    {
      name: 'Intermediate Event',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'inspector-accordion-intermediate-gateway-config',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
          ],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
};
