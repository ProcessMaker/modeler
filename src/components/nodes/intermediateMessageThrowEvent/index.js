import component from './intermediateMessageThrowEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateMessageEventConfig from '@/components/nodes/intermediateMessageEvent';
import { messageSelector, default as messageEventDefinition } from '../messageEventDefinition';
import defaultNames from '@/components/nodes/intermediateEvent/defaultNames';

const id = 'processmaker-modeler-intermediate-message-throw-event';

export default merge(cloneDeep(intermediateMessageEventConfig), {
  ...messageEventDefinition,
  id,
  component,
  control: false,
  bpmnType: 'bpmn:IntermediateThrowEvent',
  label: defaultNames[id],
  icon: require('@/assets/toolpanel/intermediate-message-throw-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateThrowEvent', {
      name: $t(defaultNames[id]),
      eventDefinitions: [
        moddle.create('bpmn:MessageEventDefinition'),
      ],
    });
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [
            {},
            messageSelector('Select the message reference that this element throws'),
          ],
        },
      ],
    },
  ],
});
