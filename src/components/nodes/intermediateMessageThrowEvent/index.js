import component from './intermediateMessageThrowEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateMessageEventConfig from '@/components/nodes/intermediateMessageEvent';
import omit from 'lodash/omit';

export default merge(cloneDeep(intermediateMessageEventConfig), {
  id: 'processmaker-modeler-intermediate-message-throw-event',
  component,
  control: false,
  bpmnType: 'bpmn:IntermediateThrowEvent',
  label: 'Intermediate Message Throw Event',
  icon: require('@/assets/toolpanel/intermediate-message-throw-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateThrowEvent', {
      name: $t('Intermediate Message Throw Event'),
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
