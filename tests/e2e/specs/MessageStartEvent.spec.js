import { assertDownloadedXmlContainsExpected, dragFromSourceToDest, getElementAtPosition } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Message Start Event', () => {
  it('Can create message start event', () => {
    const messageStartEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.startEvent, messageStartEventPosition);
    cy.get('[data-test=switch-to-message-start-event]').click();

    assertDownloadedXmlContainsExpected(`
      <bpmn:startEvent id="node_3" name="Message Start Event">
        <bpmn:messageEventDefinition />
      </bpmn:startEvent>
    `);

    const intermediateMessageThrowEvent = { x: 350, y: 350 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateMessageThrowEvent);
    cy.get('[data-test=switch-to-intermediate-message-throw-event]').click();
    getElementAtPosition(messageStartEventPosition).click();
    cy.contains('Listen For Message').next('select').select('node_5_message');

    assertDownloadedXmlContainsExpected(`
      <bpmn:startEvent id="node_3" name="Message Start Event">
        <bpmn:messageEventDefinition messageRef="node_5_message" />
      </bpmn:startEvent>
    `);
  });
});
