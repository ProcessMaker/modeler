import component from './intermediateSignalThrowEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateEventConfig from '@/components/nodes/intermediateEvent';
import omit from 'lodash/omit';

export default merge(cloneDeep(intermediateEventConfig), {
  id: 'processmaker-modeler-intermediate-signal-throw-event',
  component,
  control: false,
  bpmnType: 'bpmn:IntermediateThrowEvent',
  label: 'Intermediate Signal Throw Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateThrowEvent', {
      name: $t('Intermediate Signal Throw Event'),
      eventDefinitions: [
        moddle.create('bpmn:SignalEventDefinition'),
      ],
    });
  },
  inspectorData(node) {
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'eventDefinitions') {
        data.signalName = value[0].get('signalRef').name;
      } else {
        data[key] = value;
      }

      return data;
    }, {});
  },
  inspectorHandler(value, node, setNodeProp) {
    for (const key in omit(value, ['$type', 'eventDefinitions', 'signalName'])) {
      if (node.definition[key] === value[key]) {
        continue;
      }

      setNodeProp(node, key, value[key]);
    }

    const signal = node.definition.get('eventDefinitions')[0].signalRef;
    if (signal.name !== value.signalName) {
      signal.name = value.signalName;
    }
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [
            {},
            {
              component: 'FormInput',
              config: {
                label: 'Signal Name',
                name: 'signalName',
                helper: 'Enter the signal name that is unique from all other elements in the diagram',
              },
            },
          ],
        },
      ],
    },
  ],
});
