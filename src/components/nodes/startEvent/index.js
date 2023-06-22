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
  items: [
    {
      icon: require('@/assets/toolpanel/start-event.svg'),
      label: defaultNames[id],
      control: true,
      bpmnType: 'bpmn:StartEvent',
      rank: 10,
      id: 'processmaker-modeler-start-event',
    },
    {
      icon: require('@/assets/toolpanel/message-start-event.svg'),
      label: defaultNames['processmaker-modeler-message-start-event'],
      control: true,
      bpmnType: 'bpmn:StartEvent',
      rank: 11,
      id: 'processmaker-modeler-message-start-event',
    },
    {
      icon: require('@/assets/toolpanel/conditional-start-event.svg'),
      label: defaultNames['processmaker-modeler-conditional-start-event'],
      control: true,
      bpmnType: 'bpmn:StartEvent',
      rank: 12,
      id: 'processmaker-modeler-conditional-start-event',
    },
    {
      icon: require('@/assets/toolpanel/signal-start-event.svg'),
      label: defaultNames['processmaker-modeler-signal-start-event'],
      control: true,
      bpmnType: 'bpmn:StartEvent',
      rank: 13,
      id: 'processmaker-modeler-signal-start-event',
    },
    {
      icon: require('@/assets/toolpanel/timer-start-event.svg'),
      label: defaultNames['processmaker-modeler-start-timer-event'],
      control: true,
      bpmnType: 'bpmn:StartEvent',
      rank: 14,
      id: 'processmaker-modeler-start-timer-event',

    },
  ],
  definition(moddle, $t) {
    return moddle.create('bpmn:StartEvent', {
      name: $t(defaultNames[id]),
    });
  },
});
