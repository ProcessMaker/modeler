import component from './intermediateMessageThrowEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateMessageEventConfig from '@/components/nodes/intermediateMessageEvent';
import { messageSelector, default as messageEventDefinition } from '../messageEventDefinition';
import defaultNames from '@/components/nodes/intermediateEvent/defaultNames';
import messageThrowEventDataInputsConfig from '@/components/inspectors/messageThrowEventDataInputsConfig';

const id = 'processmaker-modeler-intermediate-message-throw-event';

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
    // First get the messageRef data from messageEventDefinition
    const messageData = messageEventDefinition.inspectorData(node);
    
    // Then get the default data
    const data = defaultDataTransform(node);
    
    // Merge messageRef data
    Object.assign(data, messageData);
    
    // Reconstruct dataInputs from BPMN elements
    if (node.definition.dataInputs && node.definition.dataInputAssociations) {
      const dataInputs = [];
      
      node.definition.dataInputs.forEach(dataInput => {
        if (!dataInput || !dataInput.id) return;
        
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
      data.dataInputs = [];
    }
    
    return data;
  },

  // eslint-disable-next-line no-unused-vars
  inspectorHandler(value, node, setNodeProp, moddle, definitions, defaultInspectorHandler, isMultiplayer) {
    // Handle messageRef using the messageEventDefinition handler
    if (value.messageRef !== undefined) {
      messageEventDefinition.inspectorHandler(value, node, setNodeProp, moddle, definitions);
    }
    
    // Handle dataInputs by creating proper BPMN structure
    if (value.dataInputs !== undefined) {
      try {
        // Clear existing data inputs
        node.definition.dataInputs = [];
        node.definition.dataInputAssociations = [];
        node.definition.inputSet = undefined;
        
        if (Array.isArray(value.dataInputs) && value.dataInputs.length > 0) {
          const dataInputs = [];
          const dataInputAssociations = [];
          
          value.dataInputs.forEach(item => {
            if (!item || !item.id) return;
            
            // Create data input
            const dataInput = moddle.create('bpmn:DataInput', {
              id: item.id,
              name: item.name || '',
            });
            dataInputs.push(dataInput);
            
            // Create data input association
            const dataInputAssociation = moddle.create('bpmn:DataInputAssociation', {
              targetRef: dataInput,
            });
            
            // Add assignments if they exist
            if (item.assignments && Array.isArray(item.assignments) && item.assignments.length > 0) {
              const assignments = item.assignments
                .filter(assignment => assignment.from && assignment.to)
                .map(assignment => {
                  try {
                    return moddle.create('bpmn:Assignment', {
                      from: moddle.create('bpmn:Expression', { body: assignment.from }),
                      to: moddle.create('bpmn:Expression', { body: assignment.to }),
                    });
                  } catch (error) {
                    console.error('Error creating assignment:', error);
                    return null;
                  }
                })
                .filter(assignment => assignment !== null);
              
              if (assignments.length > 0) {
                dataInputAssociation.assignment = assignments;
              }
            }
            
            dataInputAssociations.push(dataInputAssociation);
          });
          
          // Create input set
          const inputSet = moddle.create('bpmn:InputSet', {
            dataInputRefs: dataInputs,
          });
          
          // Set the properties
          node.definition.dataInputs = dataInputs;
          node.definition.dataInputAssociations = dataInputAssociations;
          node.definition.inputSet = inputSet;
        }
      } catch (error) {
        console.error('Error handling data inputs:', error);
        // Fallback to simple property storage
        setNodeProp(node, 'dataInputs', value.dataInputs);
      }
    }
    
    // eslint-disable-next-line no-unused-vars
    const { dataInputs, messageRef, ...otherProperties } = value;
    if (Object.keys(otherProperties).length > 0) {
      defaultInspectorHandler(otherProperties, isMultiplayer);
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