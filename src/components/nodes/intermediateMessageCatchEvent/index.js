import component from './intermediateMessageCatchEvent.vue';
import MessageEventIdGenerator from '../../../MessageEventIdGenerator';
import CatchEventMessageSelect from './CatchEventMessageSelect';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateMessageEventConfig from '@/components/nodes/intermediateMessageEvent';

const messageEventIdGenerator = new MessageEventIdGenerator();

export default merge(cloneDeep(intermediateMessageEventConfig), {
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
          id: messageEventIdGenerator.generateNewMessageEventId(),
          variableName: 'message',
        }),
      ],
    });
  },
});
