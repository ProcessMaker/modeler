import component from './intermediateSignalCatchEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateEventConfig from '@/components/nodes/intermediateEvent';
import signalEventDefinition from '../signalEventDefinition';

export default merge(cloneDeep(intermediateEventConfig), {
  ...signalEventDefinition,
  id: 'processmaker-modeler-intermediate-signal-catch-event',
  component,
  control: false,
  bpmnType: 'bpmn:IntermediateCatchEvent',
  label: 'Intermediate Signal Catch Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateCatchEvent', {
      name: $t('Intermediate Signal Catch Event'),
      eventDefinitions: [
        moddle.create('bpmn:SignalEventDefinition'),
      ],
    });
  },
});
