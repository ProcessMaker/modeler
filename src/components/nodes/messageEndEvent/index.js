import component from './messageEndEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import endEventConfig from '@/components/nodes/endEvent';

export default merge(cloneDeep(endEventConfig), {
  id: 'processmaker-modeler-message-end-event',
  component,
  icon: require('@/assets/toolpanel/end-email-event.svg'),
  label: 'Message End Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:EndEvent', {
      name: $t('Message End Event'),
      eventDefinitions: [
        moddle.create('bpmn:MessageEventDefinition'),
      ],
    });
  },
});
