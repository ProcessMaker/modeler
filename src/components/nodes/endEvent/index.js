import component from './endEvent.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import defaultNames from '@/components/nodes/endEvent/defaultNames';
import icon from '@/assets/toolpanel/end-event.svg?url';
import endEventIcon from '@/assets/toolpanel/end-event.svg?url';
import messageEndEventIcon from '@/assets/toolpanel/message-end-event.svg?url';
import errorEndEventIcon from '@/assets/toolpanel/error-end-event.svg?url';
import signalEndEventIcon from '@/assets/toolpanel/signal-end-event.svg?url';
import terminateEndEventIcon from '@/assets/toolpanel/terminate-end-event.svg?url';

const id = 'processmaker-modeler-end-event';

export default {
  id,
  component,
  bpmnType: 'bpmn:EndEvent',
  control: true,
  category: 'BPMN',
  icon,
  label: defaultNames[id],
  rank: 30,
  items: [
    {
      icon: endEventIcon,
      label: defaultNames[id],
      control: true,
      rank: 31,
      id: 'processmaker-modeler-end-event',
    },
    {
      icon: messageEndEventIcon,
      label: defaultNames['processmaker-modeler-message-end-event'],
      control: true,
      rank: 32,
      id: 'processmaker-modeler-message-end-event',
    },
    {
      icon: errorEndEventIcon,
      label: defaultNames['processmaker-modeler-error-end-event'],
      control: true,
      rank: 33,
      id: 'processmaker-modeler-error-end-event',
    },
    {
      icon: signalEndEventIcon,
      label: defaultNames['processmaker-modeler-signal-end-event'],
      control: true,
      rank: 34,
      id: 'processmaker-modeler-signal-end-event',
    },
    {
      icon: terminateEndEventIcon,
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
