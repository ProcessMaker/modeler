import component from './intermediateSignalThrowEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateEventConfig from '@/components/nodes/intermediateEvent';
import signalEventDefinition from '../signalEventDefinition';
import defaultNames from '@/components/nodes/intermediateEvent/defaultNames';
import SignalSelect from '@/components/inspectors/SignalSelect';

const id = 'processmaker-modeler-intermediate-signal-throw-event';

export default merge(cloneDeep(intermediateEventConfig), {
  ...signalEventDefinition,
  id,
  component,
  control: false,
  bpmnType: 'bpmn:IntermediateThrowEvent',
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateThrowEvent', {
      name: $t(defaultNames[id]),
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
              component: SignalSelect,
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
