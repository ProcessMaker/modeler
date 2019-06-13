import  NodeIdGenerator from './NodeIdGenerator';
import store from '@/store';

export default class MessageEventIdGenerator extends NodeIdGenerator {
  constructor(definitions) {
    super(definitions);
  }


  generateNewMessageEventId() {
    let id = super.generateNewNodeId('message_event_');

    while (this.isIdUnique(id)) {
      id = this.generateNewMessageEventId();
    }

    return id;
  }

  isIdUnique(id) {
    const nodes = store.getters.nodes;

    const eventDefinitionIdList = nodes.map(node => {
      return node.definition;
    }).filter(node => {
      return node.eventDefinitions;
    }).map(node => {
      return node.eventDefinitions;
    }).flat().map(messageEventDefinition => {
      return messageEventDefinition.id;
    });

    return eventDefinitionIdList.includes(id);
  }
}
