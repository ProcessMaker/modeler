import component from './startTimerEvent.vue';
import TimerExpression from '../../inspectors/TimerExpression.vue';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import defaultNames from '@/components/nodes/baseStartEvent/defaultNames';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import baseStartEventConfig from '@/components/nodes/baseStartEvent';

const id = 'processmaker-modeler-start-timer-event';

export default merge(cloneDeep(baseStartEventConfig), {
  id,
  component,
  label: defaultNames[id],
  definition(moddle, $t) {
    let startEventDefinition = moddle.create('bpmn:StartEvent', {
      name: $t(defaultNames[id]),
    });

    startEventDefinition.eventDefinitions = [moddle.create('bpmn:TimerEventDefinition', {
      timeCycle: moddle.create('bpmn:Expression', {
        body: '',
      }),
    })];

    return startEventDefinition;
  },
  inspectorHandler(value, node, setNodeProp, moddle) {
    const definition = node.definition;

    for (const key in value) {
      if (definition[key] === value[key]) {
        continue;
      }

      if (key === 'eventDefinitions') {
        const body = value[key];
        if (typeof body === 'object') {
          continue;
        }
        const expression = definition.get(key)[0].timeCycle;
        if (expression && expression.body === body) {
          continue;
        }

        const eventDefinition = {
          timeCycle: moddle.create('bpmn:Expression', { body }),
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
      items: [
        {},
        {
          component: 'FormAccordion',
          container: true,
          config: {
            label: 'Timing Control',
            icon: 'clock',
            name: 'inspector-accordion-start-timer-timing-control',
          },
          items: [
            {
              component: TimerExpression,
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
});
