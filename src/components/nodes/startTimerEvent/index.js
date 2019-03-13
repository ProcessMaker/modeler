import component from './startTimerEvent.vue';
import TimerExpression from '../../inspectors/TimerExpression.vue';
import moment from 'moment';

export default {
  id: 'processmaker-modeler-start-timer-event',
  component,
  bpmnType: 'bpmn:StartEvent',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/start-timer-event.svg'),
  label: 'Start Timer Event',
  definition(moddle) {
    let datetime = moment().set('hour', 0).set('minutes', 0).format('YYYY-MM-DDTHH:mmZ');
    let startEventDefinition = moddle.create('bpmn:StartEvent', {
      name: 'Start Timer Event',
    });

    startEventDefinition.eventDefinitions = [moddle.create('bpmn:TimerEventDefinition', {
      timeCycle: moddle.create('bpmn:Expression', {
        body: 'R/' + datetime + '/P1W',
      }),
    })];

    return startEventDefinition;
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
  inspectorHandler(value, node, setNodeProp, moddle) {
    const definition = node.definition;

    // Go through each property and rebind it to our data
    for (const key in value) {
      if (definition[key] === value[key]) {
        continue;
      }

      if (key === 'eventDefinitions') {
        const body = value[key];

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
  /**
   * Validate whether to accept an incoming flow from the node
   *
   * @param node
   */
  validateIncoming() {
    return false;
  },
  inspectorConfig: [
    {
      name: 'Start Timer Event',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Start Timer Event',
            fontSize: '2em',
          },
        },
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
                helper: 'The id field should be unique across all elements in the diagram',
                name: 'id',
              },
            },
            {
              component: 'FormInput',
              config: {
                label: 'Name',
                helper: 'The Name of the Start Event',
                name: 'name',
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
              component: TimerExpression,
              config: {
                label: 'Name',
                helper: 'The Name of the Start Event',
                name: 'eventDefinitions',
              },
            },
          ],
        },
      ],
    },
  ],
};
