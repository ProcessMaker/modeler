import Node from './node';

const timerPropertyKeys = ['timeDuration', 'timeDate', 'timeCycle'];

export default class TimerEventNode extends Node {
  clone(...args) {
    const clonedNode = super.clone(...args);
    const timerKey = timerPropertyKeys.find(key => clonedNode.definition.get('eventDefinitions')[0][key]);

    clonedNode.definition.get('eventDefinitions')[0][timerKey].body = this.definition.get('eventDefinitions')[0][timerKey].body;

    return clonedNode;
  }
}
