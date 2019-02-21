import component from './intermediateTimerEvent.vue';
import IntermediateTimer from '../../inspectors/IntermediateTimer.vue';

export default {
  id: 'processmaker-modeler-intermediate-catch-timer-event',
  component,
  bpmnType: 'bpmn:IntermediateCatchEvent',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/intermediate-time-event.svg'),
  label: 'Intermediate Timer Event',
  definition(moddle) {
    return moddle.create('bpmn:IntermediateCatchEvent', {
      name: 'Intermediate Timer Event',
      eventDefinitions: [
        moddle.create('bpmn:TimerEventDefinition', {
          timeDuration: moddle.create('bpmn:Expression', {
            body: 'P1D',
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
  inspectorHandler(value, node, setNodeProp, moddle) {
    const definition = node.definition;

    // Go through each property and rebind it to our data
    for (const key in value) {
      if (definition[key] === value[key]) {
        definition.set('name', value.name);
        continue;
      }

      if (key === 'eventDefinitions') {
        // Set the timer event definition
        const type = Object.keys(value[key][0])[1];
        const eventDefinition = {};
        eventDefinition[type] = moddle.create('bpmn:Expression', {
          body: value[key][0][type].body,
        });
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
      name: 'Intermediate Timer Event',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Intermediate Timer Event',
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
            helper: 'The Name of the Intermediate Event',
            name: 'name',
          },
        },
        {
          component: IntermediateTimer,
          config: {
            label: 'Name',
            helper: 'Time expression',
            name: 'eventDefinitions.0',
          },
        },
      ],
    },
  ],
};
