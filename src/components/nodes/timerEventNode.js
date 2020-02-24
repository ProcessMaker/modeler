import Node from './node';

export default class TimerEventNode extends Node {
  static timerPropertyKeys = ['timeDuration', 'timeDate', 'timeCycle'];

  clone(nodeRegistry, moddle, $t) {
    const definition = nodeRegistry[this.type].definition(moddle, $t);
    const diagram = nodeRegistry[this.type].diagram(moddle);
    const clonedNode = new TimerEventNode(this.type, definition, diagram);

    clonedNode.id = null;
    Node.diagramPropertiesToCopy.forEach(prop => clonedNode.diagram.bounds[prop] = this.diagram.bounds[prop]);
    clonedNode.definition.name = this.definition.name;

    const timerKey = TimerEventNode.timerPropertyKeys.find(key => this.definition.eventDefinitions[0][key]);

    if (!clonedNode.definition.eventDefinitions[0][timerKey]) {
      clonedNode.definition.eventDefinitions[0][timerKey] = {};
    }

    clonedNode.definition.eventDefinitions[0][timerKey].body = this.definition.eventDefinitions[0][timerKey].body;

    return clonedNode;
  }
}
