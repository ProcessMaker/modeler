import {
  removeNodeFlows,
} from '@/components/crown/utils';
import SequenceFlow from '@/components/nodes/genericFlow/SequenceFlow';

export class DetachObjectFlows {
  modeler = null;
  constructor(modeler) {
    this.modeler = modeler;
    window.ProcessMaker.EventBus.$on('detachNodeFlows', ( data ) => {
      this.detachObjectFlows(data);
    });
  }

  detachObjectFlows(nodeId) {
    const element = this.modeler.getElementByNodeId(nodeId);
    if (!element) {
      return;
    }
    const { node } = element.component;

    if (node?.definition?.incoming && node?.definition?.outgoing) {
      const incoming = node.definition.incoming[0];
      const outgoing = node.definition.outgoing[0];

      const sourceElem = this.modeler.getElementByNodeId(incoming.sourceRef.id);
      const targetElem = this.modeler.getElementByNodeId(outgoing.targetRef.id);

      if (sourceElem && targetElem) {
        this.createAndAddSequenceFlow(sourceElem, targetElem, incoming, outgoing);
      }

      // remove node flows
      removeNodeFlows(node, this.modeler);
    }
  }

  createAndAddSequenceFlow(sourceElem, targetElem, incoming, outgoing) {
    // create a sequence flow instance
    const sequenceFlow = new SequenceFlow(this.modeler.nodeRegistry, this.modeler.moddle, this.modeler.paper);
    const newFlow = sequenceFlow.makeFlowNode(sourceElem, targetElem, this.prepareWaypoint(incoming, outgoing));
    // add Node
    this.modeler.addNode(newFlow);
  }

  prepareWaypoint(incoming, outgoing) {
    const incomingLink = this.modeler.getElementByNodeId(incoming.id);
    const outgoingLink = this.modeler.getElementByNodeId(outgoing.id);
    return [
      incomingLink.component.shapeView.sourceAnchor.toJSON(),
      outgoingLink.component.shapeView.targetAnchor.toJSON(),
    ];
  }
}
