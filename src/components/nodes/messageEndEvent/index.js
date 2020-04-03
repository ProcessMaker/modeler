import component from './messageEndEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import endEventConfig from '@/components/nodes/endEvent';
import omit from 'lodash/omit';
import defaultNames from '@/components/nodes/endEvent/defaultNames';

const id = 'processmaker-modeler-message-end-event';

export default merge(cloneDeep(endEventConfig), {
  id,
  component,
  control: false,
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:EndEvent', {
      name: $t(defaultNames[id]),
      eventDefinitions: [
        moddle.create('bpmn:MessageEventDefinition'),
      ],
    });
  },
  inspectorData(node) {
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'eventDefinitions') {
        data.messageName = value[0].get('messageRef').name;
      } else {
        data[key] = value;
      }

      return data;
    }, {});
  },
  inspectorHandler(value, node, setNodeProp) {
    for (const key in omit(value, ['$type', 'eventDefinitions', 'messageName'])) {
      if (node.definition[key] === value[key]) {
        continue;
      }

      setNodeProp(node, key, value[key]);
    }

    const message = node.definition.get('eventDefinitions')[0].messageRef;
    if (message.name !== value.messageName) {
      message.name = value.messageName;
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
                label: 'Message Name',
                name: 'messageName',
                helper: 'Enter the message name that is unique from all other elements in the diagram',
              },
            },
          ],
        },
      ],
    },
  ],
});
