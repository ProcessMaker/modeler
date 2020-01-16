import component from './intermediateMessageCatchEvent.vue';
import CatchEventMessageSelect from './CatchEventMessageSelect';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateMessageEventConfig from '@/components/nodes/intermediateMessageEvent';
import omit from 'lodash/omit';

export default merge(cloneDeep(intermediateMessageEventConfig), {
  id: 'processmaker-modeler-intermediate-message-catch-event',
  component,
  control: false,
  bpmnType: 'bpmn:IntermediateCatchEvent',
  label: 'Intermediate Message Catch Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateCatchEvent', {
      name: $t('Intermediate Message Catch Event'),
      allowedUsers: '',
      allowedGroups: '',
      whitelist: '',
      eventDefinitions: [
        moddle.create('bpmn:MessageEventDefinition'),
      ],
    });
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
            {
              component: 'FormSelect',
              config: {
                label: 'Allowed Users',
                helper: 'Select allowed users',
                name: 'allowedUsers',
                options: [
                  {},
                  { value: '1,10', content: '1,10' },
                ],
              },
            },
            {
              component: 'FormSelect',
              config: {
                label: 'Allowed Groups',
                helper: 'Select allowed groups',
                name: 'allowedGroups',
                options: [
                  {},
                  { value: '20,30', content: '20,30' },
                ],
              },
            },
            {
              component: 'FormInput',
              config: {
                label: 'Whitelist',
                helper: 'IP/Domain whitelist',
                name: 'whitelist',
              },
            },
          ],
        },
      ],
    },
  ],
});
