import omit from 'lodash/omit';

export function inspector() {
  return [
    {
      component: 'FormInput',
      config: {
        label: 'Condition',
        name: 'condition',
        helper: 'Expression to evaluate condition',
      },
    },
  ];
}

export default {
  inspectorData(node) {
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'eventDefinitions') {
        data.condition = value[0].get('condition').body;
      } else {
        data[key] = value;
      }
      return data;
    }, {});
  },
  inspectorHandler(value, node, setNodeProp) {
    for (const key in omit(value, ['$type', 'eventDefinitions'])) {
      if (node.definition[key] === value[key]) {
        continue;
      }
      if (key === 'condition') {
        node.definition.get('eventDefinitions')[0].get('condition').body = value[key];

        window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
          id: node.definition.id,
          key,
          value: value[key],
        });
      } else {
        window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
          id: node.definition.id , key, value: value[key],
        });
        setNodeProp(node, key, value[key]);
      }
    }
  },
};
