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
  INPUT_SET: 'bpmn:InputSet',
};

const createDataInput = (item, moddle) => {
  return moddle.create(BPMN_TYPES.DATA_INPUT, {
    id: item.id,  
    name: item.name,
  });
};

const createAssignments = (assignments, moddle) => {
  // Safety check for backward compatibility
  if (!Array.isArray(assignments)) {
    return [];
  }
  
  return assignments
    .filter(assignment => assignment.from && assignment.to)
    .map(assignment => moddle.create(BPMN_TYPES.ASSIGNMENT, {
      from: moddle.create(BPMN_TYPES.EXPRESSION, { body: assignment.from }),
      to: moddle.create(BPMN_TYPES.EXPRESSION, { body: assignment.to }),
    }));
};

const extractAssignments = (assignments) => {
  // Safety check for backward compatibility
  if (!assignments || !Array.isArray(assignments)) {
    return [];
  }
  
  return assignments.map(assignment => ({
    from: assignment.from ? assignment.from.body : '',
    to: assignment.to ? assignment.to.body : '',
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

  inspectorData(node, defaultDataTransform) {
    const data = defaultDataTransform(node);
    
    // Reconstruct dataInputs from BPMN elements
    if (node.definition.dataInputs && node.definition.dataInputAssociations) {
      const dataInputs = [];
      
      node.definition.dataInputs.forEach(dataInput => {
        // Safety check
        if (!dataInput || !dataInput.id) {
          return;
        }
        
        const dataInputAssociation = node.definition.dataInputAssociations.find(
          association => association && association.targetRef && association.targetRef.id === dataInput.id,
        );
        
        const assignments = dataInputAssociation && dataInputAssociation.assignment 
          ? extractAssignments(dataInputAssociation.assignment)
          : [];
        
        dataInputs.push({
          id: dataInput.id,
          name: dataInput.name || '',
          assignments,
        });
      });
      
      data.dataInputs = dataInputs;
    } else {
      // Initialize empty array for backward compatibility
      data.dataInputs = [];
    }
    
    return data;
  },

  // eslint-disable-next-line no-unused-vars
  inspectorHandler(value, node, setNodeProp, moddle, definitions, defaultInspectorHandler, isMultiplayer) {
    // Handle dataInputs specifically
    if (value.dataInputs && Array.isArray(value.dataInputs)) {
      const dataInputs = [];
      const dataInputAssociations = [];
      value.dataInputs.forEach(item => {
        // Safety check
        if (!item || !item.id) {
          return;
        }
        
        const dataInput = createDataInput(item, moddle);
        dataInputs.push(dataInput);
        dataInputAssociations.push(moddle.create('bpmn:DataInputAssociation', {
          targetRef: dataInput,
          assignment: createAssignments(item.assignments, moddle),
        }));
      });
      const inputSet = moddle.create('bpmn:InputSet', {
        dataInputRefs: dataInputs,
      });
      node.definition.dataInputs = dataInputs;
      node.definition.dataInputAssociations = dataInputAssociations;
      node.definition.inputSet = inputSet;
    }
    
    // Handle all other properties using the default handler
    const { ...otherProperties } = value;
    if (Object.keys(otherProperties).length > 0) {
      defaultInspectorHandler(otherProperties, node, setNodeProp, moddle, definitions, isMultiplayer);
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