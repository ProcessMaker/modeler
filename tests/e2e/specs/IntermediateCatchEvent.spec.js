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

describe('Intermediate Catch Event', () => {
  it('Removes messageRef when message is deleted', () => {
    const intermediateCatchEventPosition = { x: 350, y: 250 };
    const intermediateThrowEventPosition = { x: 350, y: 400 };
    clickAndDropElement(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-intermediate-message-catch-event]').click();
    modalConfirm();

    clickAndDropElement(nodeTypes.intermediateCatchEvent, intermediateThrowEventPosition);
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-intermediate-message-throw-event]').click();
    modalConfirm();

    toggleInspector();
    getElementAtPosition(intermediateCatchEventPosition).click();
    cy.get('[data-test="messageRef:select"]').selectOption('node_5_message');

    const messageRef = '<bpmn:messageEventDefinition messageRef="node_5_message" />';

    assertDownloadedXmlContainsExpected(messageRef);

    getElementAtPosition(intermediateThrowEventPosition).click().then($throwEvent => {
      getCrownButtonForElement($throwEvent, 'delete-button').click({ force: true });
    });

    waitToRenderAllShapes();

    assertDownloadedXmlDoesNotContainExpected(messageRef);
  });
});
