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
  // eslint-disable-next-line no-console
  console.log('  removeOutgoingAndIncomingRefsToFlow', node.id, node.type, node);

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
