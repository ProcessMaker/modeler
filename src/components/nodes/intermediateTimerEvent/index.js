import component from './intermediateTimerEvent.vue';
import IntermediateTimer from '../../inspectors/IntermediateTimer.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import defaultNames from '@/components/nodes/intermediateEvent/defaultNames';

export const defaultDurationValue = 'PT1H';
const id = 'processmaker-modeler-intermediate-catch-timer-event';

export default {
  id,
  component,
  bpmnType: 'bpmn:IntermediateCatchEvent',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/generic-intermediate-event.svg'),
  label: 'Intermediate Event',
  rank: 20,
  items: [
    {
      icon: require('@/assets/toolpanel/intermediate-timer-event.svg'),
      label: 'Intermediate Timer Event',
      control: true,
      rank: 21,
      id: 'processmaker-modeler-intermediate-catch-timer-event',
    },
    {
      icon: require('@/assets/toolpanel/intermediate-signal-catch-event.svg'),
      label: 'Intermediate Signal Catch Event',
      control: true,
      rank: 22,
      id: 'processmaker-modeler-intermediate-signal-catch-event',
    },
    {
      icon: require('@/assets/toolpanel/intermediate-signal-throw-event.svg'),
      label: 'Intermediate Signal Throw Event',
      control: true,
      rank: 23,
      id: 'processmaker-modeler-intermediate-signal-throw-event',
    },
    {
      icon: require('@/assets/toolpanel/intermediate-message-catch-event.svg'),
      label: 'Intermediate Message Catch Event',
      control: true,
      rank: 24,
      id: 'processmaker-modeler-intermediate-message-catch-event',
    },
    {
      icon: require('@/assets/toolpanel/intermediate-message-throw-event.svg'),
      label: 'Intermediate Message Throw Event',
      control: true,
      rank: 25,
      id: 'processmaker-modeler-intermediate-message-throw-event',
    },
    {
      icon: require('@/assets/toolpanel/intermediate-conditional-catch-event.svg'),
      label: 'Intermediate Conditional Catch Event',
      control: true,
      rank: 26,
      id: 'processmaker-modeler-intermediate-conditional-catch-event',
    },
  ],
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateCatchEvent', {
      name: $t(defaultNames[id]),
      eventDefinitions: [
        moddle.create('bpmn:TimerEventDefinition', {
          timeDuration: moddle.create('bpmn:Expression', {
            body: defaultDurationValue,
          }),
        }),
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
  inspectorData(node) {
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'eventDefinitions') {
        const type = Object.keys(value[0])[1];
        const body = value[0][type].body;
        data[key] = { type, body };
      } else {
        data[key] = value;
      }

      return data;
    }, {});
  },
  inspectorHandler(value, node, setNodeProp, moddle) {
    const definition = node.definition;

    // Go through each property and rebind it to our data
    for (const key in value) {
      if (definition[key] === value[key]) {
        continue;
      }

      if (key === 'eventDefinitions') {
        const { type, body } = value[key];

        const expression = definition.get(key)[0][type];
        if (expression && expression.body === body) {
          continue;
        }

        const eventDefinition = {
          [type]: moddle.create('bpmn:Expression', { body }),
        };

        const eventDefinitions = [
          moddle.create('bpmn:TimerEventDefinition', eventDefinition),
        ];
        setNodeProp(node, 'eventDefinitions', eventDefinitions);
      } else {
        setNodeProp(node, key, value[key]);
      }
    }
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
            name: 'inspector-accordion-intermediate-timer-config',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
          ],
        },
        {
          component: 'FormAccordion',
          container: true,
          config: {
            label: 'Timing Control',
            icon: 'clock',
            name: 'inspector-accordion-intermediate-timer-event-timing-control',
          },
          items: [
            {
              component: IntermediateTimer,
              config: {
                label: 'Name',
                helper: 'Time expression',
                name: 'eventDefinitions',
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
