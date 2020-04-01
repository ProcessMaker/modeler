import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Terminate End Event', () => {
  it('Can create terminate end event', () => {
    const terminateEndEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(terminateEndEventPosition, nodeTypes.endEvent, 'switch-to-terminate-end-event');

    assertDownloadedXmlContainsExpected(`
      <bpmn:endEvent id="node_3" name="Terminate End Event">
        <bpmn:terminateEventDefinition />
      </bpmn:endEvent>
    `);
  });
});
