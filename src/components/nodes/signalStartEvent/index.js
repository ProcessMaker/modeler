import component from './signalStartEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import startEventConfig from '../startEvent';
import defaultNames from '@/components/nodes/startEvent/startNames';

export default merge(cloneDeep(startEventConfig), {
  id: 'processmaker-modeler-signal-start-event',
  control: false,
  component,
  label: defaultNames['start-signal'],
  definition(moddle, $t) {
    return moddle.create('bpmn:StartEvent', {
      name: $t(defaultNames['start-signal']),
      eventDefinitions: [
        moddle.create('bpmn:SignalEventDefinition'),
      ],
    });
  },
  validateIncoming() {
    return false;
  },
});
