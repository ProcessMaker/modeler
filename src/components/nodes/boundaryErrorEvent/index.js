import component from './boundaryErrorEvent.vue';
import boundaryEventConfig from '../boundaryEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

export default merge(cloneDeep(boundaryEventConfig), {
  id: 'processmaker-modeler-boundary-error-event',
  component,
  label: 'Boundary Error Event',
  icon: require('@/assets/toolpanel/boundary-error-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('New Boundary Error Event'),
      eventDefinitions: [
        moddle.create('bpmn:ErrorEventDefinition'),
      ],
    });
  },
});
