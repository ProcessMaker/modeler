import component from './intermediateMessageCatchEvent.vue';
import webhookFormGroup from './webhookFormGroup.vue';

export default {
  id: 'processmaker-modeler-intermediate-message-catch-timer-event',
  component,
  bpmnType: 'bpmn:IntermediateCatchEvent',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/intermediate-mail-event.svg'),
  label: 'Intermediate Message Catch Event',
  definition(moddle) {
    return moddle.create('bpmn:IntermediateCatchEvent', {
      name: '',
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
            name: 'confifuration',
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
              component: webhookFormGroup,
              config: {
                name: 'webhook',
              },
            },
            {
              component: 'FormInput',
              config: {
                label: 'Condition',
                helper: 'Expression to be evaluated on webhook to activate event. Leave blank to accept always.',
                condition: 'condition',
              },
            },
          ],
        },
      ],
    },
  ],
};
