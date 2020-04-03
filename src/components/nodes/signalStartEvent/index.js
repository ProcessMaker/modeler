import component from './signalStartEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import startEventConfig from '../startEvent';
import signalEventDefinition from '../signalEventDefinition';
import defaultNames from '@/components/nodes/startEvent/defaultNames';

const id = 'processmaker-modeler-signal-start-event';

export default merge(cloneDeep(startEventConfig), {
  ...signalEventDefinition,
  id,
  control: false,
  component,
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:StartEvent', {
      name: $t(defaultNames[id]),
      eventDefinitions: [
        moddle.create('bpmn:SignalEventDefinition'),
      ],
    });
  },
  validateIncoming() {
    return false;
  },
});
