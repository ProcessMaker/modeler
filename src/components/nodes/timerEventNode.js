import Node from './node';

export default class TimerEventNode extends Node {
  static timerPropertyKeys = ['timeDuration', 'timeDate', 'timeCycle'];

  clone(...args) {
    const clonedNode = super.clone(...args);
    const timerKey = TimerEventNode.timerPropertyKeys.find(key => this.definition.eventDefinitions[0][key]);

    if (!clonedNode.definition.eventDefinitions[0][timerKey]) {
      clonedNode.definition.eventDefinitions[0][timerKey] = {};
    }

    clonedNode.definition.eventDefinitions[0][timerKey].body = this.definition.eventDefinitions[0][timerKey].body;

    return clonedNode;
  }
}
