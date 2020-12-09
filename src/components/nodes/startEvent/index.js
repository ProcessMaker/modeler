import component from './startEvent.vue';
import defaultNames from '../baseStartEvent/defaultNames';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import baseStartEventConfig from '@/components/nodes/baseStartEvent';

const id = 'processmaker-modeler-start-event';

export default merge(cloneDeep(baseStartEventConfig), {
  id,
  component,
  control: true,
  icon: require('@/assets/toolpanel/start-event.svg'),
  label: defaultNames[id],
  rank: 10,
  definition(moddle, $t) {
    return moddle.create('bpmn:StartEvent', {
      name: $t(defaultNames[id]),
    });
  },
});
