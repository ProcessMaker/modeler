import component from '@/components/nodes/intermediateEvent/intermediateEvent.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';

export default {
  id: 'processmaker-modeler-intermediate-message',
  component,
  bpmnType: 'bpmn:IntermediateEvent',
  control: true,
  category: 'BPMN',
  label: 'Intermediate Message Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateEvent', {
      name: $t('Intermediate Message Event'),
      eventDefinitions: [
        moddle.create('bpmn:MessageEventDefinition', {}),
      ],
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
      name: 'Intermediate Message Event',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'inspector-accordion-intermediate-message-event',
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
