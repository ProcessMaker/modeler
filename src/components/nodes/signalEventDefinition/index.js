import omit from 'lodash/omit';
import SignalSelect from '@/components/inspectors/SignalSelect';

export function signalSelector(helper, editEnabled = true) {
  return {
    component: SignalSelect,
    config: {
      label: 'Signal',
      name: 'signalRef',
      helper,
      canEdit: editEnabled,
    },
  };
}

export default {
  inspectorData(node) {
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'eventDefinitions') {
        const signal = value[0].get('signalRef');
        data.signalRef = signal ? signal.id : '';
      } else {
        data[key] = value;
      }
      return data;
    }, {});
  },
  inspectorHandler(value, node, setNodeProp, moddle, definitions) {
    for (const key in omit(value, ['$type', 'eventDefinitions', 'signalRef'])) {
      if (node.definition[key] === value[key]) {
        continue;
      }

      setNodeProp(node, key, value[key]);
    }

    let signal = definitions.rootElements.find(element => element.id === value.signalRef);
    if (!signal && value.signalRef) {
      signal = moddle.create('bpmn:Signal', {
        id: value.signalRef,
        name: value.signalRef,
      });
      definitions.rootElements.push(signal);
    }
    node.definition.get('eventDefinitions')[0].signalRef = signal;
  },
};
