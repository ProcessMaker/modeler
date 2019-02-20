import component from './startTimerEvent.vue';
import TimerExpression from '../../inspectors/TimerExpression.vue';

export default {
  id: 'processmaker-modeler-start-timer-event',
  component,
  bpmnType: 'bpmn:StartEvent',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/start-timer-event.svg'),
  label: 'Start Timer Event',
  definition(moddle) {
    let startEventDefinition = moddle.create('bpmn:StartEvent', {
      name: 'Start Timer Event',
    });

    startEventDefinition.eventDefinitions = moddle.create('bpmn:TimerEventDefinition', {
      timeCycle: moddle.create('bpmn:Expression', {
        body: '',
      }),
    });

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
        // Set the timer event definition
        const eventDefinitions = [
          moddle.create('bpmn:TimerEventDefinition', {
            timeCycle: moddle.create('bpmn:Expression', {
              body: value[key][0].timeCycle.body,
            }),
          }),
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
        {
          component: TimerExpression,
          config: {
            label: 'Name',
            helper: 'The Name of the Start Event',
            name: 'eventDefinitions.0.timeCycle.body',
          },
        },
      ],
    },
  ],
};
