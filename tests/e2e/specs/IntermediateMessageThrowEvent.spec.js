import {
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  dragFromSourceToDest,
  getCrownButtonForElement,
  getElementAtPosition,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

const messageRef = 'node_3_message';
const messageName = 'awesome message name';
const eventXMLSnippet = `
  <bpmn:intermediateThrowEvent id="node_3" name="Intermediate Message Throw Event">
    <bpmn:messageEventDefinition messageRef="${messageRef}" />
  </bpmn:intermediateThrowEvent>
`;
const messageXMLSnippet = `<bpmn:message id="${ messageRef }" name="${ messageName }" />`;
const intermediateMessageThrowEventPosition = { x: 300, y: 200 };

describe('Intermediate Message Throw Event', () => {
  it('can render an intermediate message throw event', function() {
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateMessageThrowEventPosition);
    cy.get('[data-test=switch-to-intermediate-message-throw-event]').click();

    getElementAtPosition(intermediateMessageThrowEventPosition).click();

    assertDownloadedXmlContainsExpected(eventXMLSnippet);
  });

  it('can create a message when intermediate message throw event is dragged on', function() {
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateMessageThrowEventPosition);
    cy.get('[data-test=switch-to-intermediate-message-throw-event]').click();

    getElementAtPosition(intermediateMessageThrowEventPosition).click();

    typeIntoTextInput('[name=messageName]', messageName);

    assertDownloadedXmlContainsExpected(eventXMLSnippet, messageXMLSnippet);
  });

  it('can remove the message when intermediate message throw event is deleted', function() {
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateMessageThrowEventPosition);
    cy.get('[data-test=switch-to-intermediate-message-throw-event]').click();

    getElementAtPosition(intermediateMessageThrowEventPosition).click();

    typeIntoTextInput('[name=messageName]', messageName);

    assertDownloadedXmlContainsExpected(messageXMLSnippet);

    getElementAtPosition(intermediateMessageThrowEventPosition).click().then($intermediateMessageThrowEvent => {
      getCrownButtonForElement($intermediateMessageThrowEvent, 'delete-button').click();
    });

    assertDownloadedXmlDoesNotContainExpected(messageXMLSnippet);
  });

  it('retains new message name when clicking off and on intermediate message throw event', function() {
    const startEventPosition = { x: 150, y: 150 };

    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateMessageThrowEventPosition);
    cy.get('[data-test=switch-to-intermediate-message-throw-event]').click();

    getElementAtPosition(intermediateMessageThrowEventPosition).click();

    typeIntoTextInput('[name=messageName]', messageName);

    getElementAtPosition(startEventPosition).click();
    waitToRenderAllShapes();
    getElementAtPosition(intermediateMessageThrowEventPosition).click({ force: true });
    cy.get('[name=messageName]').should('have.value', messageName);
  });

  it('can associate and rename message on intermediate message catch event', function() {
    const intermediateMessageCatchEventPosition = { x: 200, y: 300 };
    const catchEventXMLSnippet = `
      <bpmn:intermediateCatchEvent id="node_5" name="Intermediate Message Catch Event">
        <bpmn:messageEventDefinition messageRef="${messageRef}" />
      </bpmn:intermediateCatchEvent>
    `;

    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateMessageThrowEventPosition);
    cy.get('[data-test=switch-to-intermediate-message-throw-event]').click();
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateMessageCatchEventPosition);
    cy.get('[data-test=switch-to-intermediate-message-catch-event]').click();

    getElementAtPosition(intermediateMessageCatchEventPosition).click();
    cy.get('[name=messageRef]').select(messageRef);

    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    typeIntoTextInput('[name=messageName]', messageName);

    getElementAtPosition(intermediateMessageCatchEventPosition).click();
    cy.get('[name=messageRef]').should('contain', messageName);

    assertDownloadedXmlContainsExpected(eventXMLSnippet, catchEventXMLSnippet, messageXMLSnippet);
  });
});
