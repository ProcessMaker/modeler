import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Signal Start Event', () => {
  it('Can create signal start event', () => {
    const signalStartEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(signalStartEventPosition, nodeTypes.startEvent, 'switch-to-signal-start-event');

    assertDownloadedXmlContainsExpected(`
      <bpmn:startEvent id="node_3" name="Signal Start Event">
        <bpmn:signalEventDefinition />
      </bpmn:startEvent>
    `);
  });
});
