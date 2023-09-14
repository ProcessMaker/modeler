import { assertDownloadedXmlContainsExpected, clickAndDropElement, getElementAtPosition, modalConfirm, toggleInspector } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Message Start Event', () => {
  it('Can create message start event', () => {
    const messageStartEventPosition = { x: 350, y: 250 };
    clickAndDropElement(nodeTypes.startEvent, messageStartEventPosition);
    cy.get('[data-test=select-type-dropdown').click();
    cy.get('[data-test=switch-to-message-start-event]').click();
    modalConfirm();

    assertDownloadedXmlContainsExpected(`
      <bpmn:startEvent id="node_3" name="Message Start Event">
        <bpmn:messageEventDefinition />
      </bpmn:startEvent>
    `);

    const intermediateMessageThrowEvent = { x: 450, y: 350 };
    clickAndDropElement(nodeTypes.intermediateCatchEvent, intermediateMessageThrowEvent);
    cy.get('[data-test=select-type-dropdown').click();
    cy.get('[data-test=switch-to-intermediate-message-throw-event]').click();
    modalConfirm();

    toggleInspector();
    getElementAtPosition(messageStartEventPosition).click();
    cy.get('[data-test="messageRef:select"]').selectOption('node_5_message');

    assertDownloadedXmlContainsExpected(`
      <bpmn:startEvent id="node_3" name="Message Start Event">
        <bpmn:messageEventDefinition messageRef="node_5_message" />
      </bpmn:startEvent>
    `);
  });
});
