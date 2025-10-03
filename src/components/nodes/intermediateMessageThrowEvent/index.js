import component from './intermediateMessageThrowEvent.vue';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import intermediateMessageEventConfig from '@/components/nodes/intermediateMessageEvent';
import { messageSelector, default as messageEventDefinition } from '../messageEventDefinition';
import defaultNames from '@/components/nodes/intermediateEvent/defaultNames';
import messageThrowEventDataInputsConfig from '@/components/inspectors/messageThrowEventDataInputsConfig';

const id = 'processmaker-modeler-intermediate-message-throw-event';

/**
 * Extracts assignment mappings (from/to) from BPMN assignments.
 * @param {Array} assignments
 * @returns {Array} Cleaned list of assignments
 */
const extractAssignments = (assignments) => {
  if (!Array.isArray(assignments)) return [];

  const extractValue = (field) =>
    typeof field === 'string'
      ? field
      : field?.get?.('body') || field?.body || '';

  return assignments.map(({ from, to } = {}) => ({
    from: extractValue(from),
    to: extractValue(to),
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
    
    // Use local storage to maintain assignments data
    if (!node._localAssignmentsData) {
      node._localAssignmentsData = {};
    }
    
    // Reconstruct dataInputs from BPMN elements
    const dataInputsFromModel = node.definition.dataInputs;
    const dataInputAssociationsFromModel = node.definition.dataInputAssociations;
    
    if (dataInputsFromModel && dataInputAssociationsFromModel) {
      const dataInputs = [];
      dataInputsFromModel.forEach(dataInput => {
        // Handle both moddle objects and plain objects
        const dataInputId = dataInput.get ? dataInput.get('id') : dataInput.id;
        const dataInputName = dataInput.get ? dataInput.get('name') : dataInput.name;
        
        if (!dataInput || !dataInputId) return;
        
        // Check if we have local data for this dataInput
        if (node._localAssignmentsData[dataInputId]) {
          dataInputs.push({
            id: dataInputId,
            name: dataInputName || '',
            assignments: node._localAssignmentsData[dataInputId],
          });
          return;
        }
        
        // Find the corresponding data input association for this data input
        const dataInputAssociation = dataInputAssociationsFromModel.find(association => {
          const targetRef = association.get ? association.get('targetRef') : association.targetRef;
          const targetId = targetRef && (targetRef.get ? targetRef.get('id') : targetRef.id);
          return targetId === dataInputId;
        });
        
        const rawAssignments = dataInputAssociation && (dataInputAssociation.get ? dataInputAssociation.get('assignment') : dataInputAssociation.assignment);
        
        const assignments = rawAssignments 
          ? extractAssignments(rawAssignments)
          : [];

        // Store in local data for future use
        node._localAssignmentsData[dataInputId] = assignments;
        
        dataInputs.push({
          id: dataInputId,
          name: dataInputName || '',
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
          // Initialize local storage if not exists
          if (!node._localAssignmentsData) {
            node._localAssignmentsData = {};
          }

          let dataInputs = [];
          if (Array.isArray(value.dataInputs) && value.dataInputs.length > 0) {
            const dataInputAssociations = [];
            
            value.dataInputs.forEach(item => {
              if (!item || !item.id) return;
              
              // Create data input
              const dataInput = moddle.create('bpmn:DataInput');
              dataInput.set('id', item.id);
              dataInput.set('name', item.name || '');
              dataInputs.push(dataInput);
              
              // Create data input association
              const dataInputAssociation = moddle.create('bpmn:DataInputAssociation');
              dataInputAssociation.set('targetRef', dataInput);
              
              // Store assignments in local storage
              const assignments = item.assignments || [];
              node._localAssignmentsData[item.id] = assignments;
              
              // Create assignments for BPMN model
              const assignmentObjects = [];
              if (assignments && Array.isArray(assignments) && assignments.length > 0) {
                
                assignments.forEach(assignment => {
                  if (assignment.from || assignment.to) { // Include assignments even if one field is empty
                    try {
                      const assignmentObj = moddle.create('bpmn:Assignment', {
                        from: moddle.create('bpmn:Expression', { body: assignment.from || '' }),
                        to: moddle.create('bpmn:Expression', { body: assignment.to || '' }),
                      });
                      assignmentObjects.push(assignmentObj);
                    } catch (error) {
                      console.error('Error creating assignment:', error);
                    }
                  }
                });
              }
              
              // Always set assignments (even if empty) to ensure the property exists
              dataInputAssociation.set('assignment', assignmentObjects);
              dataInputAssociations.push(dataInputAssociation);
            });
            
            // Create input set
            const inputSet = moddle.create('bpmn:InputSet');
            inputSet.set('dataInputRefs', dataInputs);
            
            // Use direct assignment for better persistence'
            setTimeout(() => {
              node.definition.dataInputs = dataInputs;
              node.definition.dataInputAssociations = dataInputAssociations;
              node.definition.inputSet = inputSet;
            }, 10);

          }
        } catch (error) {
          console.error('Error handling data inputs:', error);
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