import {
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  clickAndDropElement,
  getCrownButtonForElement,
  getElementAtPosition,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe.skip('Start Message Event', () => {
  it('Removes messageRef when message is deleted', () => {
    const startMessageEventPosition = { x: 250, y: 250 };
    const endMessageEventPosition = { x: 250, y: 350 };
    clickAndDropElement(nodeTypes.startEvent, startMessageEventPosition);
    cy.get('[data-test=switch-to-message-start-event]').click();

    clickAndDropElement(nodeTypes.endEvent, endMessageEventPosition);
    cy.get('[data-test=switch-to-message-end-event]').click();

    getElementAtPosition(startMessageEventPosition).click();
    cy.get('[data-test="messageRef:select"]').selectOption('node_5_message');

    const messageRef = '<bpmn:messageEventDefinition messageRef="node_5_message" />';

    assertDownloadedXmlContainsExpected(messageRef);

    getElementAtPosition(endMessageEventPosition).click().then($throwEvent => {
      getCrownButtonForElement($throwEvent, 'delete-button').click({ force: true });
    });

    waitToRenderAllShapes();

    assertDownloadedXmlDoesNotContainExpected(messageRef);
  });
});
