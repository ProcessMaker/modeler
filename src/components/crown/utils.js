import pull from 'lodash/pull';
import {bpmnType as dataOutputAssociationType} from '@/components/nodes/dataOutputAssociation/config';
import {bpmnType as dataInputAssociationType} from '@/components/nodes/dataInputAssociation/config';

export function removeFlows(graph, shape, keepSequenceFlows = false) {
  let linkShapes = graph.getConnectedLinks(shape);

  if (keepSequenceFlows) {
    linkShapes = linkShapes.filter(link => !link.component.node.isBpmnType('bpmn:SequenceFlow'));
  }


  linkShapes.forEach(shape => this.$emit('remove-node', shape.component.node));
  shape.getEmbeddedCells({ deep: true })
    .filter(cell => {
      if (keepSequenceFlows) {
        return cell.component && !cell.component.node.isBpmnType('bpmn:SequenceFlow');
      }

      return cell.component;
    })
    .forEach(cell => {
      graph.getConnectedLinks(cell).forEach(shape => this.$emit('remove-node', shape.component.node));
      shape.unembed(cell);

      this.$emit('remove-node', cell.component.node);
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
