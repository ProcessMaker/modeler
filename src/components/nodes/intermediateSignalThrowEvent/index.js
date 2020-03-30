import component from './intermediateSignalThrowEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateEventConfig from '@/components/nodes/intermediateEvent';
import signalEventDefinition from '../signalEventDefinition';

export default merge(cloneDeep(intermediateEventConfig), {
  ...signalEventDefinition,
  id: 'processmaker-modeler-intermediate-signal-throw-event',
  component,
  control: false,
  bpmnType: 'bpmn:IntermediateThrowEvent',
  label: 'Intermediate Signal Throw Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateThrowEvent', {
      name: $t('Intermediate Signal Throw Event'),
      eventDefinitions: [
        moddle.create('bpmn:SignalEventDefinition'),
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
                label: 'Signal Ref',
                name: 'signalRef',
                helper: 'Enter the signal reference that this element triggers',
              },
            },
          ],
        },
      ],
    },
  ],
});
