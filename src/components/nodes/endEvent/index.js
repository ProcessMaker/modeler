import component from './endEvent.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import defaultNames from '@/components/nodes/endEvent/defaultNames';

const id = 'processmaker-modeler-end-event';

export default {
  id,
  component,
  bpmnType: 'bpmn:EndEvent',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/end-event.svg'),
  label: defaultNames[id],
  rank: 30,
  items: [
    {
      icon: require('@/assets/toolpanel/end-event.svg'),
      label: defaultNames[id],
      control: true,
      rank: 31,
      id: 'processmaker-modeler-end-event',
    },
    {
      icon: require('@/assets/toolpanel/message-end-event.svg'),
      label: defaultNames['processmaker-modeler-message-end-event'],
      control: true,
      rank: 32,
      id: 'processmaker-modeler-message-end-event',
    },
    {
      icon: require('@/assets/toolpanel/error-end-event.svg'),
      label: defaultNames['processmaker-modeler-error-end-event'],
      control: true,
      rank: 33,
      id: 'processmaker-modeler-error-end-event',
    },
    {
      icon: require('@/assets/toolpanel/signal-end-event.svg'),
      label: defaultNames['processmaker-modeler-signal-end-event'],
      control: true,
      rank: 34,
      id: 'processmaker-modeler-signal-end-event',
    },
    {
      icon: require('@/assets/toolpanel/terminate-end-event.svg'),
      label: defaultNames['processmaker-modeler-terminate-end-event'],
      control: true,
      rank: 35,
      id: 'processmaker-modeler-terminate-end-event',
    },
  ],
  definition(moddle, $t) {
    return moddle.create('bpmn:EndEvent', {
      name: $t(defaultNames[id]),
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
      name: defaultNames[id],
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Properties',
            icon: 'cog',
            name: 'inspector-accordion-end-event',
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
