import {
  getMessagesList,
  getMessage,
} from '@/components/nodes/intermediateMessageCatchEvent/intermediateMessageCatchEventUtils.js';

function MessageFactory(id, name) {
  return {
    id,
    name,
    $type: 'bpmn:Message',
    get(key) {
      return this[key];
    },
  };
}

function NotMessageFactory() {
  return { $type: 'bpmn:NotMessage' };
}

function StoreFactory(rootElements) {
  return {
    getters: { rootElements },
  };
}

describe('intermediateMessageCatchEventUtils', () => {
  it('getMessagesList returns an options list of messages', () => {
    const store = StoreFactory([
      MessageFactory('message_1', 'Message 1'),
      NotMessageFactory(),
      MessageFactory('message_2', 'Message 2'),
      NotMessageFactory(),
    ]);

    expect(getMessagesList(store)).toEqual([
      { value: 'message_1', content: 'Message 1' },
      { value: 'message_2', content: 'Message 2' },
    ]);
  });

  it('getMessagesList returns empty list when there are no elements', () => {
    const store = StoreFactory([]);

    expect(getMessagesList(store)).toEqual([]);
  });

  it('getMessage returns message', () => {
    const message = MessageFactory('message_2', 'Message 2');
    const store = StoreFactory([
      MessageFactory('message_1', 'Message 1'),
      message,
    ]);

    expect(getMessage(store, 'message_2')).toBe(message);
  });
});
