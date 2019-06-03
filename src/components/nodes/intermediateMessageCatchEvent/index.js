import component from './intermediateMessageCatchEvent.vue';
import omit from 'lodash/omit';

export default {
  id: 'processmaker-modeler-intermediate-message-catch-event',
  component,
  bpmnType: 'bpmn:IntermediateCatchEvent',
  control: true,
  category: 'BPMN',
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
          id: 'message_event_1',
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
      name: 'Intermediate Message Catch Event',
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
                label: 'Identifier',
                helper: 'The id field should be unique across all elements in the diagram',
                name: 'id',
              },
            },
            {
              component: 'FormInput',
              config: {
                label: 'Name',
                helper: 'The Name of the Intermediate Message Catch Event',
                name: 'name',
              },
            },
            {
              component: 'FormInput',
              config: {
                label: 'Message Event Identifier',
                helper: 'The id field should be unique across all elements in the diagram',
                name: 'eventDefinitionId',
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
};
