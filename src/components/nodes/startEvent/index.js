import component from './startEvent.vue';
import defaultNames from '../baseStartEvent/defaultNames';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import baseStartEventConfig from '@/components/nodes/baseStartEvent';
import icon from '@/assets/toolpanel/start-event.svg';
import startEventIcon from '@/assets/toolpanel/start-event.svg';
import messageStartEventIcon from '@/assets/toolpanel/message-start-event.svg';
import conditionalStartEventIcon from '@/assets/toolpanel/conditional-start-event.svg';
import signalStartEventIcon from '@/assets/toolpanel/signal-start-event.svg';
import timerStartEventIcon from '@/assets/toolpanel/timer-start-event.svg';

const id = 'processmaker-modeler-start-event';

export default merge(cloneDeep(baseStartEventConfig), {
  id,
  component,
  control: true,
  icon,
  label: defaultNames[id],
  rank: 10,
  items: [
    {
      icon: startEventIcon,
      label: defaultNames[id],
      control: true,
      bpmnType: 'bpmn:StartEvent',
      rank: 10,
      id: 'processmaker-modeler-start-event',
    },
    {
      icon: messageStartEventIcon,
      label: defaultNames['processmaker-modeler-message-start-event'],
      control: true,
      bpmnType: 'bpmn:StartEvent',
      rank: 11,
      id: 'processmaker-modeler-message-start-event',
    },
    {
      icon: conditionalStartEventIcon,
      label: defaultNames['processmaker-modeler-conditional-start-event'],
      control: true,
      bpmnType: 'bpmn:StartEvent',
      rank: 12,
      id: 'processmaker-modeler-conditional-start-event',
    },
    {
      icon: signalStartEventIcon,
      label: defaultNames['processmaker-modeler-signal-start-event'],
      control: true,
      bpmnType: 'bpmn:StartEvent',
      rank: 13,
      id: 'processmaker-modeler-signal-start-event',
    },
    {
      icon: timerStartEventIcon,
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
