import Node from '@/components/nodes/node';
import * as associationConfig from './associationConfig';

export class AssociationFlow {
  constructor(nodeRegistry, moddle, paper) {
    this.nodeRegistry = nodeRegistry;
    this.moddle = moddle;
    this.paper = paper;
  }

  makeFlowNode(sourceShape, targetShape, waypoint) {
    const diagram = associationConfig.diagram(this.moddle);
    const associationFlow = associationConfig.definition(this.moddle);

    associationFlow.set('sourceRef', sourceShape.component.node.definition);
    associationFlow.set('targetRef', targetShape.component.node.definition);

    diagram.waypoint = waypoint.map(point => this.moddle.create('dc:Point', point));

    const node = new Node(
      associationConfig.id,
      associationFlow,
      diagram,
    );
    return node;
  }
}
