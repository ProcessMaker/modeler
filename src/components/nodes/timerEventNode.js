import Node from './node';

export default class TimerEventNode extends Node {
  static timerPropertyKeys = ['timeDuration', 'timeDate', 'timeCycle'];

  clone(nodeRegistry, moddle, $t) {
    return this.withTimerKeys(super.clone(nodeRegistry, moddle, $t));
  }

  withTimerKeys(node) {
    const timerKey = TimerEventNode.timerPropertyKeys.find(key => this.definition.eventDefinitions[0][key]);

    if (!node.definition.eventDefinitions[0][timerKey]) {
      node.definition.eventDefinitions[0][timerKey] = {};
    }

    node.definition.eventDefinitions[0][timerKey].body = this.definition.eventDefinitions[0][timerKey].body;

    return node;
  }
}
