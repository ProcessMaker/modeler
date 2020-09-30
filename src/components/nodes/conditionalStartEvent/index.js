import component from './conditionalStartEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import baseStartEventConfig from '@/components/nodes/baseStartEvent';
import { default as eventDefinition, inspector } from '../conditionalEventDefinition';
import defaultNames from '@/components/nodes/baseStartEvent/defaultNames';

const id = 'processmaker-modeler-conditional-start-event';

export default merge(cloneDeep(baseStartEventConfig), {
  ...eventDefinition,
  id,
  component,
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:StartEvent', {
      name: $t(defaultNames[id]),
      eventDefinitions: [
        moddle.create('bpmn:ConditionalEventDefinition', {
          condition: moddle.create('bpmn:FormalExpression', {
            body: '',
          }),
        }),
      ],
    });
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [
            {},
            ...inspector(),
          ],
        },
      ],
    },
  ],
});
