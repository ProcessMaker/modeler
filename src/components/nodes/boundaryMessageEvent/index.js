import component from './boundaryMessageEvent.vue';
import boundaryEventConfig from '../boundaryEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

boundaryEventConfig.inspectorConfig[0].items[0].items.push(
  {
    component: 'FormCheckbox',
    config: {
      label: 'Interrupting',
      name: 'cancelActivity',
      helper: 'Boundary Event Type',
    },
  },
);

export default merge(cloneDeep(boundaryEventConfig), {
  id: 'processmaker-modeler-boundary-message-event',
  component,
  label: 'Boundary Message Event',
  icon: require('@/assets/toolpanel/intermediate-mail-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('New Boundary Message Event'),
      cancelActivity: true,
      eventDefinitions: [
        moddle.create('bpmn:MessageEventDefinition'),
      ],
    });
  },
});
