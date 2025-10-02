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
  // Verificación de seguridad para compatibilidad hacia atrás
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
  // Verificación de seguridad para compatibilidad hacia atrás
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
        // Verificación de seguridad
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
      // Inicializar array vacío para compatibilidad hacia atrás
      data.dataInputs = [];
    }
    
    return data;
  },

  inspectorHandler(value, node, setNodeProp, moddle) {
    if (value.dataInputs && Array.isArray(value.dataInputs)) {
      const dataInputs = [];
      const dataInputAssociations = [];
      value.dataInputs.forEach(item => {
        // Verificación de seguridad
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