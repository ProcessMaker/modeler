import Node from './node';

export default class TimerEventNode extends Node {
  static timerPropertyKeys = ['timeDuration', 'timeDate', 'timeCycle'];

  clone(nodeRegistry, moddle, $t) {
    const clonedNode = super.clone(nodeRegistry, moddle, $t);
    const timerKey = TimerEventNode.timerPropertyKeys.find(key => this.definition.eventDefinitions[0][key]);

    if (!clonedNode.definition.eventDefinitions[0][timerKey]) {
      clonedNode.definition.eventDefinitions[0][timerKey] = {};
    }

    clonedNode.definition.eventDefinitions[0][timerKey].body = this.definition.eventDefinitions[0][timerKey].body;

    return clonedNode;
  }
}
