import component from './terminateEndEvent.vue';
import endEventConfig from '../endEvent/index';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import defaultNames from '@/components/nodes/endEvent/defaultNames';

export const id = 'processmaker-modeler-terminate-end-event';

export default merge(cloneDeep(endEventConfig), {
  id,
  component,
  control: false,
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:EndEvent', {
      name: $t(defaultNames[id]),
      eventDefinitions: [
        moddle.create('bpmn:TerminateEventDefinition'),
      ],
    });
  },
});
