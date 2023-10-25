import Node from '@/components/nodes/node';
import * as associationConfig from './config';
import { getOrFindDataInput } from '@/components/crown/utils';

export class DataInputAssociation {
  constructor(nodeRegistry, moddle, paper) {
    this.nodeRegistry = nodeRegistry;
    this.moddle = moddle;
    this.paper = paper;
  }

  makeFlowNode(sourceShape, targetShape, waypoint) {
    const diagram = associationConfig.diagram(this.moddle);
    const associationFlow = associationConfig.definition(this.moddle);

    // When saving the BPMN, if this is not an array the sourceRef is not stored
    const dataInput = getOrFindDataInput(this.moddle, targetShape.component.node, sourceShape.component.node.definition);
    associationFlow.set('targetRef', dataInput);
    associationFlow.set('sourceRef', [sourceShape.component.node.definition]);

    diagram.waypoint = waypoint.map(point => this.moddle.create('dc:Point', point));

    const node = new Node(
      associationConfig.id,
      associationFlow,
      diagram,
    );
    return node;
  }
}
