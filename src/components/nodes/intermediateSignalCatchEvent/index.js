import component from './intermediateSignalCatchEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateEventConfig from '@/components/nodes/intermediateEvent';
import defaultNames from '@/components/nodes/intermediateEvent/defaultNames';

const id = 'processmaker-modeler-intermediate-signal-catch-event';

export default merge(cloneDeep(intermediateEventConfig), {
  id,
  component,
  control: false,
  bpmnType: 'bpmn:IntermediateCatchEvent',
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateCatchEvent', {
      name: $t(defaultNames[id]),
      eventDefinitions: [
        moddle.create('bpmn:SignalEventDefinition'),
      ],
    });
  },
});
