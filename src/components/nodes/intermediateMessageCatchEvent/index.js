import component from './intermediateMessageCatchEvent.vue';
import MessageEventIdGenerator from '../../../MessageEventIdGenerator';
import CatchEventMessageSelect from './CatchEventMessageSelect';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateMessageEventConfig from '@/components/nodes/intermediateMessageEvent';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import omit from 'lodash/omit';

const messageEventIdGenerator = new MessageEventIdGenerator();

export default merge(cloneDeep(intermediateMessageEventConfig), {
  id: 'processmaker-modeler-intermediate-message-catch-event',
  component,
  bpmnType: 'bpmn:IntermediateCatchEvent',
  icon: require('@/assets/toolpanel/intermediate-mail-event.svg'),
  label: 'Intermediate Message Catch Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateCatchEvent', {
      name: $t('Intermediate Message Catch Event'),
      allowedUsers: '',
      allowedGroups: '',
      whitelist: '',
      eventDefinitions: [
        moddle.create('bpmn:MessageEventDefinition', {
          id: messageEventIdGenerator.generateNewMessageEventId(),
          variableName: 'message',
        }),
      ],
    });
  },
  inspectorData(node) {
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'eventDefinitions') {
        data.eventDefinitionId = value[0].get('id');
        data.variableName = value[0].get('variableName');
      } else {
        data[key] = value;
      }

      return data;
    }, {});
  },
  inspectorHandler(value, node, setNodeProp, moddle) {
    for (const key in omit(value, ['$type', 'eventDefinitionId', 'variableName'])) {
      if (node.definition[key] === value[key]) {
        continue;
      }

      setNodeProp(node, key, value[key]);
    }

    if (
      node.definition.eventDefinitions[0].get('id') !== value.variableName ||
      node.definition.eventDefinitions[0].get('variableName') !== value.eventDefinitionId
    ) {
      setNodeProp(node, 'eventDefinitions', [
        moddle.create('bpmn:MessageEventDefinition', {
          id: value['eventDefinitionId'],
          variableName: value['variableName'],
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
              component: 'FormInput',
              config: {
                label: 'Message Event Identifier',
                helper: idConfigSettings.helper,
                name: 'eventDefinitionId',
                validation: 'required',
              },
            },
            {
              component: 'FormInput',
              config: {
                label: 'Variable Name',
                helper: 'The Name of the variable',
                name: 'variableName',
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
