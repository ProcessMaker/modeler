import component from './boundarySignalEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import boundaryEventConfig from '@/components/nodes/boundaryEvent';
import interruptingToggleConfig from '@/components/nodes/boundaryEvent/interruptingToggleInspector';
import signalEventDefinition from '../signalEventDefinition';
import SignalSelect from '@/components/inspectors/SignalSelect';

export const id = 'processmaker-modeler-boundary-signal-event';

export default merge(cloneDeep(boundaryEventConfig), {
  ...signalEventDefinition,
  id,
  component,
  control: false,
  label: 'Boundary Signal Event',
  icon: require('@/assets/toolpanel/boundary-signal-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('Boundary Signal Event'),
      cancelActivity: true,
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
            interruptingToggleConfig,
            {
              component: SignalSelect,
              config: {
                label: 'Signal Ref',
                name: 'signalRef',
                helper: 'Enter the signal reference that this element catches',
              },
            },
          ],
        },
      ],
    },
  ],
});
