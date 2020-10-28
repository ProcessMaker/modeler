import component from './messageEndEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import endEventConfig from '@/components/nodes/endEvent';
import defaultNames from '@/components/nodes/endEvent/defaultNames';
import { default as messageEventDefinition, messageSelector } from '../messageEventDefinition';

const id = 'processmaker-modeler-message-end-event';

export default merge(cloneDeep(endEventConfig), {
  ...messageEventDefinition,
  id,
  component,
  control: false,
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:EndEvent', {
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
