import Node from '@/components/nodes/node';
import * as dataOutputConfig from '@/components/nodes/dataOutputAssociation/config';
import get from 'lodash/get';
import DataAssociation from '@/components/nodes/genericFlow/DataAssociation';

export default class DataOutputAssociation extends DataAssociation {
  static isValid({ sourceShape, targetShape }) {
    const sourceNode = get(sourceShape, 'component.node');
    const targetNode = get(targetShape, 'component.node');

    if (!targetNode) {
      return false;
    }

    return DataAssociation.isADataNode(targetNode) &&
      DataOutputAssociation.isValidSourceNode(sourceNode);
  }

  makeFlowNode(sourceShape, targetShape, genericLink) {
    const diagram = dataOutputConfig.diagram(this.moddle);
    const dataOutputAssociation = dataOutputConfig.definition(this.moddle);

    dataOutputAssociation.set('sourceRef', sourceShape.component.node.definition);
    dataOutputAssociation.set('targetRef', targetShape.component.node.definition);

    const start = genericLink.sourceAnchor;
    const end = genericLink.targetAnchor;

    diagram.waypoint = [start, end].map(point => this.moddle.create('dc:Point', point));

    const node = new Node(
      dataOutputConfig.id,
      dataOutputAssociation,
      diagram,
    );

    node.dataAssociationProps = {
      sourceShape,
      targetCoords: { x: undefined, y: undefined },
    };
    const sourceNode = get(sourceShape, 'component.node');
    const existingOutputAssociations = sourceNode.definition.get('dataOutputAssociations') || [];
    sourceNode.definition.set('dataOutputAssociations', [...existingOutputAssociations, node.definition]);
    return node;
  }

  static isValidSourceNode(sourceNode) {
    return !DataAssociation.isNodeDisallowedFromDataAssociation(sourceNode);
  }
}
