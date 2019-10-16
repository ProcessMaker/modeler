import component from './intermediateMessageEvent.vue';
import omit from 'lodash/omit';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import MessageEventIdGenerator from '../../../MessageEventIdGenerator';

const messageEventIdGenerator = new MessageEventIdGenerator();

export default {
  id: 'processmaker-modeler-intermediate-message',
  component,
  bpmnType: 'bpmn:IntermediateEvent',
  control: true,
  category: 'BPMN',
  label: 'Intermediate Message Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateEvent', {
      name: $t('Intermediate Message Event'),
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
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 36,
        width: 36,
        x: null,
        y: null,
      }),
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
      name: 'Intermediate Message Event',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'configuration',
          },
          items: [
            {
              component: 'FormInput',
              config: {
                ...nameConfigSettings,
                helper: 'The Name of the Intermediate Message Event',
              },
            },
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
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: false,
            label: 'Advanced',
            icon: 'cogs',
            name: 'advanced',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
          ],
        },
      ],
    },
  ],
};
