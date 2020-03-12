import component from './boundaryEscalationEvent.vue';
import boundaryEventConfig from '../boundaryEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import interruptingToggleConfig from '../boundaryEvent/interruptingToggleInspector';

export const id = 'processmaker-modeler-boundary-escalation-event';

export default merge(cloneDeep(boundaryEventConfig), {
  id,
  component,
  control: false,
  label: 'Boundary Escalation Event',
  icon: require('@/assets/toolpanel/boundary-escalation-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('Boundary Escalation Event'),
      cancelActivity: true,
      eventDefinitions: [
        moddle.create('bpmn:EscalationEventDefinition'),
      ],
      documentation: [moddle.create('bpmn:Documentation', { text: '' })],
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
