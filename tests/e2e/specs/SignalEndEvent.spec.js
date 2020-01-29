import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Signal End Event', () => {
  it('Can create signal end event', () => {
    const signalEndEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(signalEndEventPosition, nodeTypes.endEvent, 'switch-to-signal-end-event');

    assertDownloadedXmlContainsExpected(`
      <bpmn:endEvent id="node_3" name="Signal End Event">
        <bpmn:signalEventDefinition />
      </bpmn:endEvent>
    `);
  });
});
