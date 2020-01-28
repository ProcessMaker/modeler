import component from './boundarySignalEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import boundaryEventConfig from '@/components/nodes/boundaryEvent';
import interruptingToggleConfig from '@/components/nodes/boundaryEvent/interruptingToggleInspector';

export const id = 'processmaker-modeler-boundary-signal-event';

export default merge(cloneDeep(boundaryEventConfig), {
  id,
  component,
  control: false,
  label: 'Boundary Signal Event',
  icon: require('@/assets/toolpanel/boundary-signal-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('New Boundary Signal Event'),
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
          ],
        },
      ],
    },
  ],
});
