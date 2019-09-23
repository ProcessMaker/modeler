import component from './boundaryEscalationEvent.vue';
import boundaryEventConfig from '../boundaryEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(boundaryEventConfig), {
  id: 'processmaker-modeler-boundary-timer-event',
  component,
  label: 'Boundary Escalation Event',
  icon: require('@/assets/toolpanel/boundary-escalation-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('New Boundary Escalation Event'),
      cancelActivity: true,
      eventDefinitions: [
        moddle.create('bpmn:EscalationEventDefinition', {
        }),
      ],
    });
  },
  inspectorConfig: [{
    items: [
      {},
    ],
  }],
});
