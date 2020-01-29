import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Intermediate Signal Catch Event', () => {
  it('Can create an intermediate signal catch event', () => {
    const intermediateSignalCatchEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(intermediateSignalCatchEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-signal-catch-event');

    assertDownloadedXmlContainsExpected(`
      <bpmn:intermediateCatchEvent id="node_3" name="Intermediate Signal Catch Event">
        <bpmn:signalEventDefinition />
      </bpmn:intermediateCatchEvent>
    `);
  });
});
