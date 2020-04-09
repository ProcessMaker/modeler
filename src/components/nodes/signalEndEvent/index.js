import component from './signalEndEvent.vue';
import endEventConfig from '../endEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import signalEventDefinition from '../signalEventDefinition';
import defaultNames from '@/components/nodes/endEvent/defaultNames';
import SignalSelect from '@/components/inspectors/SignalSelect';

export const id = 'processmaker-modeler-signal-end-event';

export default merge(cloneDeep(endEventConfig), {
  ...signalEventDefinition,
  id,
  component,
  control: false,
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:EndEvent', {
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
