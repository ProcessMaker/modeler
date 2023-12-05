import component from './boundaryTimerEvent.vue';
import IntermediateTimer from '../../inspectors/IntermediateTimer.vue';
import boundaryEventConfig from '../boundaryEvent';
import interruptingToggleConfig from '../boundaryEvent/interruptingToggleInspector';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import icon from '@/assets/toolpanel/boundary-timer-event.svg?url';
import { defaultDurationTimerEvent } from '@/constants';
import { omit, cloneDeep, merge } from 'lodash';

export const id = 'processmaker-modeler-boundary-timer-event';

export const setEventTimerDefinition = (moddle, node, type, body) => {
  const eventDefinition = {
    [type]: moddle.create('bpmn:Expression', { body }),
  };

  return [
    moddle.create('bpmn:TimerEventDefinition', eventDefinition),
  ];
};

export default merge(cloneDeep(boundaryEventConfig), {
  id,
  component,
  control: false,
  label: 'Boundary Timer Event',
  icon,
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('Boundary Timer Event'),
      cancelActivity: true,
      eventDefinitions: [
        moddle.create('bpmn:TimerEventDefinition', {
          timeDuration: moddle.create('bpmn:Expression', {
            body: defaultDurationTimerEvent,
          }),
        }),
      ],
    });
  },
  inspectorData(node) {
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'eventDefinitions') {
        const type = Object.keys(omit(value[0], ['id', '$type', 'get', 'set', '$instanceOf']))[0];
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

        const eventDefinitions = setEventTimerDefinition(moddle, node, type, body);
        setNodeProp(node, 'eventDefinitions', eventDefinitions);
        window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
          id: node.definition.id,
          key: 'eventTimerDefinition',
          value: {
            type,
            body,
          },
        });
      } else {
        window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
          id: node.definition.id , key, value: value[key],
        });
        setNodeProp(node, key, value[key]);
      }
    }
  },
  inspectorConfig: [{
    items: [
      {
        items: [
          {},
          interruptingToggleConfig,
        ],
      },
      {
        component: 'FormAccordion',
        container: true,
        config: {
          label: 'Timing Control',
          icon: 'clock',
          name: 'inspector-accordion-boundary-timer-event',
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
      advancedAccordionConfig,
      documentationAccordionConfig,
    ],
  }],
});
