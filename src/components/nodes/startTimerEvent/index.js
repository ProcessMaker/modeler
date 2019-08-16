import component from './startTimerEvent.vue';
import TimerExpression from '../../inspectors/TimerExpression.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';

export default {
  id: 'processmaker-modeler-start-timer-event',
  component,
  bpmnType: 'bpmn:StartEvent',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/start-timer-event.svg'),
  label: 'Start Timer Event',
  definition(moddle, $t) {
    let startEventDefinition = moddle.create('bpmn:StartEvent', {
      name: $t('Start Timer Event'),
    });

    startEventDefinition.eventDefinitions = [moddle.create('bpmn:TimerEventDefinition', {
      timeCycle: moddle.create('bpmn:Expression', {
        body: '',
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
                helper: 'The Name of the Start Event',
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
