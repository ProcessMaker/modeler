import component from './startTimerEvent.vue';
import TimerExpression from '../../inspectors/TimerExpression.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import defaultNames from '@/components/nodes/startEvent/startNames';

export default {
  id: 'processmaker-modeler-start-timer-event',
  component,
  bpmnType: 'bpmn:StartEvent',
  control: false,
  category: 'BPMN',
  label: defaultNames['start-timer'],
  definition(moddle, $t) {
    let startEventDefinition = moddle.create('bpmn:StartEvent', {
      name: $t(defaultNames['start-timer']),
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
      name: defaultNames['start-timer'],
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'inspector-accordion',
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
            name: 'inspector-accordion',
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
        advancedAccordionConfig,
      ],
    },
  ],
};
