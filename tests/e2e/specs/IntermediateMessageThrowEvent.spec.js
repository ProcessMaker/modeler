import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlContainsSubstringNTimes,
  assertDownloadedXmlDoesNotContainExpected,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getCrownButtonForElement,
  getElementAtPosition,
  getNumberOfLinks,
  waitForAnimations,
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
const intermediateMessageThrowEventPosition = { x: 350, y: 200 };

describe('Intermediate Message Throw Event', () => {
  it('can render an intermediate message throw event', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');

    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    assertDownloadedXmlContainsExpected(eventXMLSnippet);
  });

  it('can create a message when intermediate message throw event is dragged on', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');

    getElementAtPosition(intermediateMessageThrowEventPosition).click();

    // Edit message
    cy.get('[data-cy="events-list"]').click();
    cy.get('[data-cy="events-edit"]').click();
    cy.get('[data-cy="events-edit-name"]').clear().type(messageName);
    cy.get('[data-cy="events-save"]').click();

    assertDownloadedXmlContainsExpected(eventXMLSnippet, messageXMLSnippet);
  });

  it('can remove the message when intermediate message throw event is deleted', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');

    // Edit message
    cy.get('[data-cy="events-list"]').click();
    cy.get('[data-cy="events-edit"]').click();
    cy.get('[data-cy="events-edit-name"]').clear().type(messageName);
    cy.get('[data-cy="events-save"]').click();

    assertDownloadedXmlContainsExpected(messageXMLSnippet);

    getElementAtPosition(intermediateMessageThrowEventPosition).click().then($intermediateMessageThrowEvent => {
      getCrownButtonForElement($intermediateMessageThrowEvent, 'delete-button').click();
    });

    assertDownloadedXmlDoesNotContainExpected(messageXMLSnippet);
  });

  it('retains new message name when clicking off and on intermediate message throw event', () => {
    const startEventPosition = { x: 150, y: 150 };
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');

    // Edit message
    cy.get('[data-cy="events-list"]').click();
    cy.get('[data-cy="events-edit"]').click();
    cy.get('[data-cy="events-edit-name"]').clear().type(messageName);
    cy.get('[data-cy="events-save"]').click();

    getElementAtPosition(startEventPosition).click();
    waitToRenderAllShapes();
    getElementAtPosition(intermediateMessageThrowEventPosition).click({ force: true });
    waitToRenderAllShapes();
    // Edit message
    cy.get('[data-cy="events-list"]').click();
    cy.get('[data-cy="events-edit"]').click();
    cy.get('[data-cy="events-edit-name"]').clear().type(messageName);
    cy.get('[data-cy="events-save"]').click();
    cy.get('[data-test="messageRef:select"] .multiselect__single').should('contain.text', messageName);
  });

  it('associates and renames message on intermediate message catch event', () => {
    const intermediateMessageCatchEventPosition = { x: 200, y: 300 };
    const catchEventXMLSnippet = `
      <bpmn:intermediateCatchEvent id="node_5" name="Intermediate Message Catch Event">
        <bpmn:messageEventDefinition messageRef="${messageRef}" />
      </bpmn:intermediateCatchEvent>
    `;
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    addNodeTypeToPaper(intermediateMessageCatchEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-catch-event');

    getElementAtPosition(intermediateMessageCatchEventPosition).click();
    waitForAnimations();

    cy.get('[data-test="messageRef:select"]').selectOption(messageRef);
    waitForAnimations();
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitForAnimations();

    // Edit message
    cy.get('[data-cy="events-list"]').click();
    cy.get('[data-cy="events-edit"]').click();
    cy.get('[data-cy="events-edit-name"]').clear().type(messageName);
    cy.get('[data-cy="events-save"]').click();

    getElementAtPosition(intermediateMessageCatchEventPosition).click();
    waitForAnimations();
    cy.get('[data-test="messageRef:select"] .multiselect__single').should('contain.text', messageName);

    assertDownloadedXmlContainsExpected(eventXMLSnippet, catchEventXMLSnippet, messageXMLSnippet);
  });

  it('does not create duplicate messages on undo/redo', () => {
    addNodeTypeToPaper({ x: 300, y: 300 }, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');

    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    assertDownloadedXmlContainsSubstringNTimes('<bpmn:message id=".*?" name=".*?" />', 1, 'Expect single message');
  });

  it('retains message name after loading XML', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');

    // Edit message
    cy.get('[data-cy="events-list"]').click();
    cy.get('[data-cy="events-edit"]').click();
    cy.get('[data-cy="events-edit-name"]').clear().type(messageName);
    cy.get('[data-cy="events-save"]').click();

    /* Something outside of the inspector panel has to be selected to trigger the focusout event;
     * otherwise it creates a race condition with the Undo button click event. */
    cy.get('[aria-label="Toolbar"]').click();

    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();

    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    cy.get('[data-test="messageRef:select"] .multiselect__single').should('contain.text', messageName);
  });

  it('allows connection between pools', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    dragFromSourceToDest(nodeTypes.pool, { x: 150, y: 150 });
    const secondPoolPosition = { x: 100, y: 450 };
    dragFromSourceToDest(nodeTypes.pool, secondPoolPosition);

    connectNodesWithFlow('generic-flow-button', intermediateMessageThrowEventPosition, secondPoolPosition);
    getNumberOfLinks().should('equal', 1);
  });


  it('allows valid message flow connections', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    dragFromSourceToDest(nodeTypes.pool, { x: 150, y: 150 });
    const secondPoolPosition = { x: 150, y: 450 };
    dragFromSourceToDest(nodeTypes.pool, secondPoolPosition);

    const validMessageThrowEventTargets = [
      { genericNode: nodeTypes.startEvent, nodeToSwitchTo: 'switch-to-message-start-event' },
      { genericNode: nodeTypes.task, nodeToSwitchTo: 'switch-to-user-task' },
      { genericNode: nodeTypes.task, nodeToSwitchTo: 'switch-to-manual-task' },
      { genericNode: nodeTypes.task, nodeToSwitchTo: 'switch-to-script-task' },
      { genericNode: nodeTypes.task, nodeToSwitchTo: 'switch-to-sub-process' },
      { genericNode: nodeTypes.intermediateCatchEvent, nodeToSwitchTo: 'switch-to-intermediate-message-catch-event' },
    ];

    validMessageThrowEventTargets.forEach(({ genericNode, nodeToSwitchTo }) => {
      const nodePosition = { x: secondPoolPosition.x + 50, y: secondPoolPosition.y + 50 };
      addNodeTypeToPaper(nodePosition, genericNode, nodeToSwitchTo);
      connectNodesWithFlow('generic-flow-button', intermediateMessageThrowEventPosition, nodePosition);
      getNumberOfLinks().should('equal', 1);
      cy.get('#delete-button').click();
    });
  });


  it('disallows invalid message flow connections', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    dragFromSourceToDest(nodeTypes.pool, { x: 150, y: 150 });
    const secondPoolPosition = { x: 150, y: 450 };
    dragFromSourceToDest(nodeTypes.pool, { x: 150, y: 450 });

    const invalidMessageThrowEventTargets = [
      { genericNode: nodeTypes.endEvent, nodeToSwitchTo: 'switch-to-message-end-event' },
      { genericNode: nodeTypes.intermediateCatchEvent, nodeToSwitchTo: 'switch-to-intermediate-message-throw-event' },
      { genericNode: nodeTypes.startEvent, nodeToSwitchTo: 'switch-to-start-event' },
      { genericNode: nodeTypes.startEvent, nodeToSwitchTo: 'switch-to-start-timer-event' },
    ];

    invalidMessageThrowEventTargets.forEach(({ genericNode, nodeToSwitchTo }) => {
      const nodePosition = { x: secondPoolPosition.x + 50, y: secondPoolPosition.y + 50 };
      addNodeTypeToPaper(nodePosition, genericNode, nodeToSwitchTo);
      connectNodesWithFlow('generic-flow-button', intermediateMessageThrowEventPosition, nodePosition);
      getNumberOfLinks().should('equal', 0);
      getElementAtPosition(nodePosition).click();
      cy.get('#delete-button').click();
    });

    getElementAtPosition(secondPoolPosition).click();
    cy.get('#lane-above-button').click({ force: true });
    const secondPoolLanePosition = { x: secondPoolPosition.x + 50, y: secondPoolPosition.y };
    connectNodesWithFlow('generic-flow-button', intermediateMessageThrowEventPosition, secondPoolLanePosition);
    getNumberOfLinks().should('equal', 0);
  });
});
