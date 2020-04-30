import component from './conditionalStartEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import baseStartEventConfig from '@/components/nodes/baseStartEvent';
import defaultNames from '@/components/nodes/baseStartEvent/defaultNames';

const id = 'processmaker-modeler-conditional-start-event';

export default merge(cloneDeep(baseStartEventConfig), {
  id,
  control: false,
  component,
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:StartEvent', {
      name: $t(defaultNames[id]),
      eventDefinitions: [
        moddle.create('bpmn:ConditionalEventDefinition'),
      ],
    });
  },
  validateIncoming() {
    return false;
  },
});
