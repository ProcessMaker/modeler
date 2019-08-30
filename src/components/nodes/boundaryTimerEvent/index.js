import component from './boundaryTimerEvent.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import IntermediateTimer from '../../inspectors/IntermediateTimer.vue';
export const defaultDurationValue = 'PT1H';

export default {
  id: 'processmaker-modeler-boundary-timer-event',
  component,
  bpmnType: 'bpmn:BoundaryEvent',
  control: false,
  category: 'BPMN',
  label: 'Boundary Timer Event',
  icon: require('@/assets/toolpanel/boundary-timer-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('New Boundary Timer Event'),
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
      name: 'Boundary Event',
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
              config: idConfigSettings,
            },
            {
              component: 'FormInput',
              config: {
                ...nameConfigSettings,
                helper: 'The Name of the Boundary Timer Event',
              },
            },
            {
              component: 'FormCheckbox',
              config: {
                label: 'Interrupting',
                name: 'cancelActivity',
                helper: 'Boundary Event Type',
              },
            },
          ],
        },
        {
          component: 'FormAccordion',
          container: true,
          config: {
            label: 'Timing Control',
            icon: 'clock',
            name: 'timing-control',
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
      ],
    },
  ],
};
