import component from './signalStartEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import startEventConfig from '../startEvent';

export default merge(cloneDeep(startEventConfig), {
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
      documentation: [moddle.create('bpmn:Documentation', { text: '' })],
    });
  },
  validateIncoming() {
    return false;
  },
});
