import { assertDownloadedXmlContainsExpected, dragFromSourceToDest, getElementAtPosition } from '../support/utils';

import { nodeTypes } from '../support/constants';

const messageEndEventPosition = { x: 300, y: 200 };

describe('Message End Event', () => {
  it('can render a message end event', function() {
    dragFromSourceToDest(nodeTypes.endEvent, messageEndEventPosition);
    cy.get('[data-test=switch-to-message-end-event]').click();

    getElementAtPosition(messageEndEventPosition).click();

    cy.get('[data-test=downloadXMLBtn]').click();

    assertDownloadedXmlContainsExpected(`
      <bpmn:endEvent id="node_3" name="Message End Event">
        <bpmn:messageEventDefinition messageRef="node_3_message" />
      </bpmn:endEvent>
    `);
  });
});
