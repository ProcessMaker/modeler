import component from './signalStartEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import startEventConfig from '../startEvent';
import signalEventDefinition from '../signalEventDefinition';

export default merge(cloneDeep(startEventConfig), {
  ...signalEventDefinition,
  id: 'processmaker-modeler-signal-start-event',
  control: false,
  component,
  label: 'Signal Start Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:StartEvent', {
      name: $t('Signal Start Event'),
      eventDefinitions: [
        moddle.create('bpmn:SignalEventDefinition'),
      ],
    });
  },
  validateIncoming() {
    return false;
  },
});
