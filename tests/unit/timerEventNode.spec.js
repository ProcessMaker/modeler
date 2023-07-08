import TimerEventNode from '@/components/nodes/timerEventNode';

const definitionFactory = (props = {}) => ({
  ...props,
  eventDefinitions: [{}],
  get(prop) { return this[prop]; },
  set(prop, val) { this[prop] = val; },
});
const mockType = 'some-type';
const mockNodeRegistry = {
  [mockType]: {
    definition() {
      return definitionFactory();
    },
    diagram() {
      return { bounds: {} };
    },
  },
};

describe('TimerEventNode', () => {
  let definition;
  let bounds;
  let node;

  beforeEach(() => {
    definition = definitionFactory({ id: 123, name: 'name' });
    bounds = { x: 1, y: 2, width: 3, height: 4 };
    node = new TimerEventNode(mockType, definition, { bpmnElement: definition, bounds });
  });

  it('clone should copy event definition timer property', () => {
    const bodyString = 'some-timer-body-string';
    const timerEventProp = TimerEventNode.timerPropertyKeys[0];
    node.definition.eventDefinitions[0][timerEventProp] = { body: bodyString };

    let clonedNode = node.clone(mockNodeRegistry);

    expect(clonedNode.definition.eventDefinitions[0][timerEventProp].body).toBe(bodyString);
  });
});
