import component from './intermediateMessageThrowEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateMessageEventConfig from '@/components/nodes/intermediateMessageEvent';

export default merge(cloneDeep(intermediateMessageEventConfig), {
  id: 'processmaker-modeler-intermediate-message-throw-event',
  component,
  bpmnType: 'bpmn:IntermediateThrowEvent',
  label: 'Intermediate Message Throw Event',
  icon: require('@/assets/toolpanel/intermediate-mail-event-alt.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateThrowEvent', {
      name: $t('Intermediate Message Throw Event'),
      eventDefinitions: [
        moddle.create('bpmn:MessageEventDefinition', {
          messageRef: 'message',
        }),
      ],
    });
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
                name: 'messageRef',
              },
            },
          ],
        },
      ],
    },
  ],
});
