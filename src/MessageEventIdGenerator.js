import  NodeIdGenerator from './NodeIdGenerator';
import store from '@/store';
import get from 'lodash/get';

export default class MessageEventIdGenerator extends NodeIdGenerator {
  generateNewMessageEventId() {
    let id = super.generateNewNodeId('message_event_');

    while (!this.isIdUnique(id)) {
      id = this.generateNewMessageEventId();
    }

    return id;
  }

  isIdUnique(id) {
    const nodes = store.getters.nodes;

    const eventDefinitionIdList = nodes
      .map(node => get(node, 'definition.eventDefinitions[0].id'))
      .filter(id => id !== undefined);

    return !eventDefinitionIdList.includes(id);
  }
}
