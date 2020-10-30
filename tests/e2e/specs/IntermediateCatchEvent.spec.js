import {
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  dragFromSourceToDest,
  getCrownButtonForElement,
  getElementAtPosition,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Intermediate Catch Event', () => {
  it('Removes messageRef when message is deleted', () => {
    const intermediateCatchEventPosition = { x: 250, y: 250 };
    const intermediateThrowEventPosition = { x: 250, y: 350 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);
    cy.get('[data-test=switch-to-intermediate-message-catch-event]').click();

    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateThrowEventPosition);
    cy.get('[data-test=switch-to-intermediate-message-throw-event]').click();

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
