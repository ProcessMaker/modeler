import { pull, get } from 'lodash';
import { bpmnType as dataOutputAssociationType } from '@/components/nodes/dataOutputAssociation/config';
import { bpmnType as dataInputAssociationType } from '@/components/nodes/dataInputAssociation/config';

export function removeFlows(graph, shape) {
  const linkShapes = graph.getConnectedLinks(shape);

  linkShapes.forEach(shape => this.$emit('remove-node', shape.component.node));
}

// Remove the incoming and outgoing flows of a node
export function removeNodeFlows(node, modeler) {
  if (node.definition.incoming) {
    node.definition.incoming.forEach((flow) => {
      const node = modeler.nodes.find(node => node.definition === flow);
      modeler.removeNode(node);
    });
  }
  if (node.definition.outgoing) {
    node.definition.outgoing.forEach((flow) => {
      const node = modeler.nodes.find(node => node.definition === flow);
      modeler.removeNode(node);
    });
  }
}
// Remove the associations of a node
export function removeNodeMessageFlows(node, modeler) {
  const linkedMessages = modeler.nodes.filter(n => {
    if (n.definition.sourceRef) {
      if (n.definition.sourceRef === node.definition) {
        return true;
      }
    }
    if (n.definition.targetRef) {
      if (n.definition.targetRef === node.definition) {
        return true;
      }
    }
  });
  linkedMessages.forEach((messageFlow) => {
    modeler.removeNode(messageFlow);
  });
}
// Remove the associations of a node
export function removeNodeAssociations(node, modeler) {
  const linkedAssociations = modeler.nodes.filter(n => {
    if (n.definition.sourceRef) {
      if (n.definition.sourceRef === node.definition) {
        return true;
      }
    }
    if (n.definition.targetRef) {
      if (n.definition.targetRef === node.definition) {
        return true;
      }
    }
  });
  linkedAssociations.forEach((association) => {
    modeler.removeNode(association);
  });
}

export function removeBoundaryEvents(graph, node, removeNode) {
  const nodeShape = graph.getCells().find(el => el.component && el.component.node === node);

  nodeShape.getEmbeddedCells({ deep: true })
    .filter(cell => {
      return cell.component && cell.component.node.isBpmnType('bpmn:BoundaryEvent');
    })
    .forEach(boundaryEventShape => {
      graph.getConnectedLinks(boundaryEventShape).forEach(shape => removeNode(shape.component.node));
      removeNode(boundaryEventShape.component.node);
    });
}

export function removeOutgoingAndIncomingRefsToFlow(node){
  if (node.isBpmnType(dataOutputAssociationType, dataInputAssociationType)) {
    return;
  }

  /* Modify source and target refs to remove incoming and outgoing properties pointing to this link */
  const { sourceRef, targetRef } = node.definition;
  if (sourceRef) {
    pull(sourceRef.get('outgoing'), node.definition);
  }

  /* If targetRef is defined, it could be a point or another element.
   * If targetRef has an id, that means it's an element and the reference to it
   * can be safely removed. */
  if (targetRef && targetRef.id) {
    pull(targetRef.get('incoming'), node.definition);
  }
}

export function removeSourceDefault(node) {
  const defaultId = get(node, 'definition.sourceRef.default.id', null);
  if (defaultId && defaultId === node.id) {
    // unset this node as the source's default
    node.definition.sourceRef.set('default', null);
  }
}

export function getOrFindDataInput(moddle, task, sourceNode) {
  if (sourceNode.$type !== 'bpmn:DataObjectReference' && sourceNode.$type !== 'bpmn:DataStoreReference') {
    throw 'Source node must be a DataObjectReference or bpmn:DataStoreReference, got ' + sourceNode.$type;
  }
  const sourceNodeId = sourceNode.id;
  const dataInputId = `data_input_${sourceNodeId}`;
  // Check if ioSpecification exists
  if (!task.definition.ioSpecification) {
    task.definition.ioSpecification = moddle.create('bpmn:InputOutputSpecification', {
      dataInputs: [],
      dataOutputs: [],
      inputSets: [],
      outputSets: [],
    });
  }
  // Check if dataInput exists
  if (!task.definition.ioSpecification.dataInputs) {
    task.definition.ioSpecification.set('dataInputs', []);
  }
  let dataInput = task.definition.ioSpecification.dataInputs.find(input => input.id === dataInputId);
  if (!dataInput) {
    task.definition.ioSpecification.dataInputs.push(moddle.create('bpmn:DataInput', {
      id: dataInputId,
      isCollection: 'false',
      name: sourceNode.name,
    }));
    task.definition.ioSpecification.set('dataInputs', task.definition.ioSpecification.dataInputs);
  }
  dataInput = task.definition.ioSpecification.dataInputs.find(input => input.id === dataInputId);
  // Check if outputSet exists
  if (!task.definition.ioSpecification.outputSets) {
    task.definition.ioSpecification.set('outputSets', [
      moddle.create('bpmn:OutputSet', {
        dataOutputRefs: [],
      }),
    ]);
  }
  let outputSet = task.definition.ioSpecification.outputSets[0];
  if (!outputSet) {
    task.definition.ioSpecification.set('outputSets', [
      moddle.create('bpmn:OutputSet', {
        dataOutputRefs: [],
      }),
    ]);
  }
  outputSet = task.definition.ioSpecification.outputSets[0];
  // Check if inputSet exists
  if (!task.definition.ioSpecification.inputSets) {
    task.definition.ioSpecification.set('inputSets', [
      moddle.create('bpmn:InputSet', {
        dataInputRefs: [],
      }),
    ]);
  }
  let inputSet = task.definition.ioSpecification.inputSets[0];
  if (!inputSet) {
    task.definition.ioSpecification.set('inputSets', [
      moddle.create('bpmn:InputSet', {
        dataInputRefs: [],
      }),
    ]);
  }
  inputSet = task.definition.ioSpecification.inputSets[0];
  // Check if dataInputRef exists
  const dataInputRef = inputSet.dataInputRefs.find(ref => ref.id === dataInputId);
  if (!dataInputRef) {
    inputSet.dataInputRefs.push(dataInput);
  }
  return dataInput;
}


export function removeDataInput(task, sourceNode) {
  if (sourceNode.$type !== 'bpmn:DataObjectReference' && sourceNode.$type !== 'bpmn:DataStoreReference') {
    throw 'Source node must be a DataObjectReference or bpmn:DataStoreReference, got ' + sourceNode.$type;
  }
  const sourceNodeId = sourceNode.id;
  const dataInputId = `data_input_${sourceNodeId}`;
  // Check if ioSpecification exists
  if (!task.definition.ioSpecification) {
    return;
  }
  // Check if dataInput exists
  if (!task.definition.ioSpecification.dataInputs) {
    return;
  }
  let dataInput = task.definition.ioSpecification.dataInputs.find(input => input.id === dataInputId);
  if (!dataInput) {
    return;
  }
  // remove dataInput from dataInputs
  pull(task.definition.ioSpecification.dataInputs, dataInput);
  // Check if inputSet exists
  if (!task.definition.ioSpecification.inputSets) {
    return;
  }
  let inputSet = task.definition.ioSpecification.inputSets[0];
  if (!inputSet) {
    return;
  }
  // Check if dataInputRef exists
  const dataInputRef = inputSet.dataInputRefs.find(ref => ref.id === dataInputId);
  if (dataInputRef) {
    pull(inputSet.dataInputRefs, dataInputRef);
  }
  // Remove inputSets if it is empty (without any dataInputRefs)
  if (inputSet.dataInputRefs.length === 0) {
    delete task.definition.ioSpecification.inputSets;
  }
  // Remove outputSets if it is empty (without any dataOutputRefs)
  if (task.definition.ioSpecification.outputSets) {
    let outputSet = task.definition.ioSpecification.outputSets[0];
    if (outputSet && (!outputSet.dataOutputRefs || outputSet.dataOutputRefs.length === 0)) {
      delete task.definition.ioSpecification.outputSets;
    }
  }
  // Remove ioSpecification if it is empty (without outputSets and inputSets)
  if (!task.definition.ioSpecification.inputSets && !task.definition.ioSpecification.outputSets) {
    delete task.definition.ioSpecification;
  }
}
