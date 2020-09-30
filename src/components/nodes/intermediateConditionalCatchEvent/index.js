import component from './intermediateConditionalCatchEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateEventConfig from '@/components/nodes/intermediateEvent';
import defaultNames from '@/components/nodes/intermediateEvent/defaultNames';
import { default as eventDefinition, inspector } from '../conditionalEventDefinition';

const id = 'processmaker-modeler-intermediate-conditional-catch-event';

export default merge(cloneDeep(intermediateEventConfig), {
  ...eventDefinition,
  id,
  component,
  control: false,
  bpmnType: 'bpmn:IntermediateCatchEvent',
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:IntermediateCatchEvent', {
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
  inspectorConfig: [{
    items: [
      {
        items: [
          {},
          ...inspector(),
        ],
      },
    ],
  }],
});
