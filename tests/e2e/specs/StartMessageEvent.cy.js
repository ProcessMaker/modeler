import {
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  clickAndDropElement,
  getCrownButtonForElement,
  getElementAtPosition,
  modalConfirm,
  toggleInspector,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Start Message Event', () => {
  it('Removes messageRef when message is deleted', () => {
    const startMessageEventPosition = { x: 350, y: 250 };
    const endMessageEventPosition = { x: 350, y: 350 };
    clickAndDropElement(nodeTypes.startEvent, startMessageEventPosition);
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-message-start-event]').click();
    modalConfirm();

    clickAndDropElement(nodeTypes.endEvent, endMessageEventPosition);
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-message-end-event]').click();
    modalConfirm();

    toggleInspector();

    getElementAtPosition(startMessageEventPosition).click();
    cy.get('[data-test="messageRef:select"]').selectOption('node_5_message');

    const messageRef = '<bpmn:messageEventDefinition messageRef="node_5_message" />';

    assertDownloadedXmlContainsExpected(messageRef);

    getElementAtPosition(endMessageEventPosition, nodeTypes.messageEndEvent).click().then($throwEvent => {
      getCrownButtonForElement($throwEvent, 'delete-button').click({ force: true });
    });

    waitToRenderAllShapes();

    assertDownloadedXmlDoesNotContainExpected(messageRef);
  });
});
