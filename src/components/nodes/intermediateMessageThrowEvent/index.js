import component from './intermediateMessageThrowEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateMessageEventConfig from '@/components/nodes/intermediateMessageEvent';
import { messageSelector, default as messageEventDefinition } from '../messageEventDefinition';
import defaultNames from '@/components/nodes/intermediateEvent/defaultNames';
import messageThrowEventDataInputsConfig from '@/components/inspectors/messageThrowEventDataInputsConfig';

const id = 'processmaker-modeler-intermediate-message-throw-event';
const BPMN_TYPES = {
  DATA_INPUT: 'bpmn:DataInput',
  ASSIGNMENT: 'bpmn:Assignment',
  EXPRESSION: 'bpmn:Expression',
  DATA_INPUT_ASSOCIATION: 'bpmn:DataInputAssociation',
  INPUT_SET: 'bpmn:InputSet'
};

const createDataInput = (item, moddle) => {
  return moddle.create(BPMN_TYPES.DATA_INPUT, {
    id: item.id,  
    name: item.name
  });
};

const createAssignments = (assignments, moddle) => {
  return assignments
    .filter(assignment => assignment.from && assignment.to)
    .map(assignment => moddle.create(BPMN_TYPES.ASSIGNMENT, {
      from: moddle.create(BPMN_TYPES.EXPRESSION, { body: assignment.from }),
      to: moddle.create(BPMN_TYPES.EXPRESSION, { body: assignment.to })
    }));
};
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
  inspectorHandler(value, node, setNodeProp, moddle, definitions, defaultInspectorHandler, isMultiplayer) {
    if (value.dataInputs) {
    const dataInputs = [];
    const dataInputAssociations = [];
      value.dataInputs.forEach(item => {
        const dataInput = createDataInput(item, moddle);
        dataInputs.push(dataInput);
        dataInputAssociations.push(moddle.create('bpmn:DataInputAssociation', {
          targetRef: dataInput,
          assignment: createAssignments(item.assignments, moddle)
        }));
      });
      const inputSet = moddle.create('bpmn:InputSet', {
        dataInputRefs: dataInputs
      });
      node.definition.dataInputs = dataInputs;
      node.definition.dataInputAssociations = dataInputAssociations;
      node.definition.inputSet = inputSet;
    }
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
        messageThrowEventDataInputsConfig,
      ],
    },
  ],
});