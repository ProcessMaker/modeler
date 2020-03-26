import component from './signalStartEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import startEventConfig from '../startEvent';
import omit from 'lodash/omit';

export default merge(cloneDeep(startEventConfig), {
  id: 'processmaker-modeler-signal-start-event',
  control: false,
  component,
  label: 'Signal Start Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:StartEvent', {
      name: $t('Signal Start Event'),
      eventDefinitions: [
        moddle.create('bpmn:SignalEventDefinition'),
      ],
    });
  },
  inspectorData(node) {
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'eventDefinitions') {
        const signal = value[0].get('signalRef');
        data.signalName = signal ? signal.name : '';
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
    if (signal && signal.name !== value.signalName) {
      signal.name = value.signalName;
    }
  },
  validateIncoming() {
    return false;
  },
});
