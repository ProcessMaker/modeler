import { pull, get } from 'lodash';
import { bpmnType as dataOutputAssociationType } from '@/components/nodes/dataOutputAssociation/config';
import { bpmnType as dataInputAssociationType } from '@/components/nodes/dataInputAssociation/config';

export function removeFlows(graph, shape) {
  const linkShapes = graph.getConnectedLinks(shape);

  linkShapes.forEach(shape => this.$emit('remove-node', shape.component.node));
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

function findNode(graph, nodeId) {
  const nodeShape = graph.getCells().find(el => el.component && el.component.node && el.component.node.definition && el.component.node.definition.id === nodeId);
  return nodeShape && nodeShape.component && nodeShape.component.node;
}

export function removePoolElements(graph, node, removeNode) {
  const isPool = node.definition.$type === 'bpmn:Participant';
  if (!isPool) return;
  if (!node.definition.processRef.laneSets) return;
  node.definition.processRef.laneSets.forEach(laneSet => {
    laneSet.lanes.forEach(lane => {
      const node = findNode(graph, lane.id);
      removeNode(node);
    });
  });
  node.definition.processRef.flowElements.forEach(element => {
    const node = findNode(graph, element.id);
    if (node) {
      removeNode(node);
    }
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
