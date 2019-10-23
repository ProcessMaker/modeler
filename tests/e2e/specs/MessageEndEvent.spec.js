import {
  assertDownloadedXMLMatchesExpected,
  dragFromSourceToDest,
  getElementAtPosition,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

const messageEndEventPosition = { x: 300, y: 200 };

describe('Message End Event', () => {
  it('can render a message end event', function() {
    dragFromSourceToDest(nodeTypes.messageEndEvent, messageEndEventPosition);

    getElementAtPosition(messageEndEventPosition).click();

    cy.get('[data-test=downloadXMLBtn]').click();

    assertDownloadedXMLMatchesExpected(`
      <bpmn:endEvent id="node_2" name="Message End Event">
        <bpmn:messageEventDefinition messageRef="node_2_message" />
      </bpmn:endEvent>
    `);
  });
});
