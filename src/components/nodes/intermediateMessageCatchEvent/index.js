import component from './intermediateMessageCatchEvent.vue';
import set from 'lodash/set';

export default {
  id: 'processmaker-modeler-intermediate-message-catch-event',
  component,
  bpmnType: 'bpmn:IntermediateCatchEvent',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/intermediate-mail-event.svg'),
  label: 'Intermediate Message Catch Event',
  definition(moddle) {
    return moddle.create('bpmn:IntermediateCatchEvent', {
      name: 'Intermediate Timer Event',
      ['pm:allowedUsers']: '',
      ['pm:allowedGroups']: '',
      ['pm:whitelist']: '',
      eventDefinitions: [
        moddle.create('bpmn:MessageEventDefinition', {
          id: '',
          ['pm:dataName']: '',
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
  inspectorHandler(value, node) {
    const definition = node.definition;

    definition.set('name', value.name);
    set(definition.$attrs, 'pm:allowedUsers', value.allowedUsers);
    set(definition.$attrs, 'pm:allowedGroups', value.allowedUsers);
    set(definition.$attrs, 'pm:whitelist', value.whitelist);
    set(definition.eventDefinitions[0], 'id', value.eventDefinitionId);
    set(definition.eventDefinitions[0].$attrs, 'pm:dataName', value.dataName );
  },
  inspectorConfig: [
    {
      name: 'Intermediate Message Catch Event',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Intermediate Message Catch Event',
            fontSize: '2em',
          },
        },
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
                label: 'Data Name',
                helper: 'The Name of the data name',
                name: 'dataName',
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
