import component from './boundarySignalEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import boundaryEventConfig from '@/components/nodes/boundaryEvent';
import interruptingToggleConfig from '@/components/nodes/boundaryEvent/interruptingToggleInspector';
import { signalSelector, default as signalEventDefinition } from '../signalEventDefinition';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';

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
            signalSelector('Signal that will trigger this boundary event'),
          ],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
});
