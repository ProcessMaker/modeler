import omit from 'lodash/omit';

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
    
    const signal = definitions.rootElements.find(element => element.id === value.signalRef);
    node.definition.get('eventDefinitions')[0].signalRef = signal;
  },    
};
