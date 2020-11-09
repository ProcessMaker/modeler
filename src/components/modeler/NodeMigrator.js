import { getAssociationFlowsForNode, keepOriginalName } from '@/components/modeler/modelerUtils';

export class NodeMigrator {
  constructor(nodeThatWillBeReplaced, definition, graph, newNode, processes, collaboration) {
    this._nodeThatWillBeReplaced = nodeThatWillBeReplaced;
    this._definition = definition;
    this._graph = graph;
    this._newNode = newNode;
    this._processes = processes;
    this._collaboration = collaboration;
  }

  migrate() {
    if (keepOriginalName(this._nodeThatWillBeReplaced)) {
      this._definition.name = this._nodeThatWillBeReplaced.definition.name;
    }

    const forceNodeToRemount = definition => {
      const shape = this._graph.getLinks().find(element => {
        return element.component && element.component.node.definition === definition;
      });
      shape.component.node._modelerId += '_replaced';
    };

    const incoming = this._nodeThatWillBeReplaced.definition.get('incoming');
    const outgoing = this._nodeThatWillBeReplaced.definition.get('outgoing');

    this._definition.get('incoming').push(...incoming);
    this._definition.get('outgoing').push(...outgoing);

    outgoing.forEach(ref => {
      ref.set('sourceRef', this._newNode.definition);
      this._handleSequenceFlowForGateway(ref);
      forceNodeToRemount(ref);
    });

    incoming.forEach(ref => {
      ref.set('targetRef', this._newNode.definition);
      this._handleSequenceFlowForGateway(ref);
      forceNodeToRemount(ref);
    });

    const associationFlows = getAssociationFlowsForNode(this._nodeThatWillBeReplaced, this._processes);
    associationFlows.forEach(flow => {
      flow.set('targetRef', this._newNode.definition);
      forceNodeToRemount(flow);
    });

    if (this._collaboration) {
      const messageFlows = this._collaboration.get('messageFlows');
      messageFlows
        .filter(flow => flow.sourceRef === this._nodeThatWillBeReplaced.definition)
        .forEach(flow => {
          flow.set('sourceRef', this._newNode.definition);
          forceNodeToRemount(flow);
        });

      messageFlows
        .filter(flow => flow.targetRef === this._nodeThatWillBeReplaced.definition)
        .forEach(flow => {
          flow.set('targetRef', this._newNode.definition);
          forceNodeToRemount(flow);
        });
    }
  }

  _handleSequenceFlowForGateway(ref) {
    // Exclusive and inclusive gateways could have conditioned flows
    const hasCondition = ['bpmn:ExclusiveGateway', 'bpmn:InclusiveGateway'].includes(ref.sourceRef.$type);

    // If the flow's source is doesn't have condition remove it:
    if (!hasCondition) {
      delete ref.conditionExpression;
    }
  }
}
