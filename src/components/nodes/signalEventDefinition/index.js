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
    this.cleanSignalDefinitions(definitions);
  },
  cleanSignalDefinitions(definitions) {
    const used = {};
    definitions.rootElements.forEach(node => {
      if (node.$type === 'bpmn:Process') {
        node.flowElements.forEach(element => {
          if (element.eventDefinitions) {
            element.eventDefinitions.forEach(event => {
              if (event.$type === 'bpmn:SignalEventDefinition' && event.signalRef) {
                used[event.signalRef.id] = true;
              }
            });
          }
        });
      }
    });
    for (let i = 0; i < definitions.rootElements.length; i++) {
      const node = definitions.rootElements[i];
      if (node.$type === 'bpmn:Signal' && !used[node.id]) {
        definitions.rootElements.splice(i, 1);
        i--;
      }
    }
    return definitions.rootElements;
  },
};
