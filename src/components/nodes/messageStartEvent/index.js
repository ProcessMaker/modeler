import component from './messageStartEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import startEventConfig from '../startEvent';
import CatchEventMessageSelect from '../intermediateMessageCatchEvent/CatchEventMessageSelect';
import omit from 'lodash/omit';
import defaultNames from '@/components/nodes/startEvent/defaultNames';

const id = 'processmaker-modeler-message-start-event';

export default merge(cloneDeep(startEventConfig), {
  id,
  control: false,
  component,
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:StartEvent', {
      name: $t(defaultNames[id]),
      group: 'StartEvent',
      eventDefinitions: [
        moddle.create('bpmn:MessageEventDefinition'),
      ],
    });
  },
  validateIncoming() {
    return false;
  },
  inspectorData(node) {
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'eventDefinitions') {
        data.messageRef = value[0].get('messageRef');
      } else {
        data[key] = value;
      }

      return data;
    }, {});
  },
  inspectorHandler(value, node, setNodeProp, moddle) {
    for (const key in omit(value, ['$type', 'messageRef'])) {
      if (node.definition[key] === value[key]) {
        continue;
      }

      setNodeProp(node, key, value[key]);
    }

    if (node.definition.eventDefinitions[0].get('messageRef') !== value.messageRef) {

      setNodeProp(node, 'eventDefinitions', [
        moddle.create('bpmn:MessageEventDefinition', {
          messageRef: value.messageRef,
        }),
      ]);
    }
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [
            {},
            {
              component: CatchEventMessageSelect,
              config: {
                label: 'Listen For Message',
                name: 'messageRef',
                helper: 'Select from which Intermediate Message Throw or Message End event to listen',
              },
            },
          ],
        },
      ],
    },
  ],
});
