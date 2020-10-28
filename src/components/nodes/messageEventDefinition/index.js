import omit from 'lodash/omit';
import MessageSelect from '@/components/inspectors/MessageSelect';

export function messageSelector(helper) {
  return {
    component: MessageSelect,
    config: {
      label: 'Message',
      name: 'messageRef',
      helper,
    },
  };
}

export default {
  inspectorData(node) {
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'eventDefinitions') {
        const message = value[0].get('messageRef');
        data.messageRef = message ? message.id : '';
      } else {
        data[key] = value;
      }
      return data;
    }, {});
  },
  inspectorHandler(value, node, setNodeProp, moddle, definitions) {
    for (const key in omit(value, ['$type', 'eventDefinitions', 'messageRef'])) {
      if (node.definition[key] === value[key]) {
        continue;
      }
      
      setNodeProp(node, key, value[key]);
    }
      
    let message = definitions.rootElements.find(element => element.id === value.messageRef);
    if (!message && value.messageRef) {
      message = moddle.create('bpmn:Message', {
        id: value.messageRef,
        name: value.messageRef,
      });
      definitions.rootElements.push(message);
    }
    node.definition.get('eventDefinitions')[0].messageRef = message;
  },
};
