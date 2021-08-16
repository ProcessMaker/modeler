import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getCrownButtonForElement,
  getElementAtPosition,
  getGraphElements,
  typeIntoTextInput,
  modalConfirm, waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Event-Based Gateway', () => {
  const eventBasedGatewayPosition = { x: 250, y: 250 };

  beforeEach(() => {
    addNodeTypeToPaper(eventBasedGatewayPosition, nodeTypes.exclusiveGateway, 'switch-to-event-based-gateway');
  });

  it('Update event-based gateway name', () => {
    getElementAtPosition(eventBasedGatewayPosition).click();
    const testString = 'testing';
    typeIntoTextInput('[name=name]', testString);

    cy.get('[name=name]').should('have.value', testString);
  });

  it('Only connect to intermediate catch events', () => {
    const startEventPosition = { x: 150, y: 150 };
    connectNodesWithFlow('generic-flow-button', startEventPosition, eventBasedGatewayPosition);

    const intermediateCatchEventPosition = { x: 500, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, intermediateCatchEventPosition);

    const intermediateMessageCatchEventPosition = { x: 500, y: 100 };
    addNodeTypeToPaper(intermediateMessageCatchEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-catch-event');
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, intermediateMessageCatchEventPosition);

    const endEventPosition = { x: 500, y: 350 };
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition);
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, endEventPosition);

    const totalNumberOfValidElements = 8;
    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(endEventPosition)
      .click()
      .then($endEvent => {
        getCrownButtonForElement($endEvent, 'delete-button').click({ force: true });
      });

    const taskPosition = { x: 450, y: 350 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, taskPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(taskPosition)
      .click()
      .then($task => {
        getCrownButtonForElement($task, 'delete-button').click({ force: true });
      });

    const scriptTaskPosition = { x: 450, y: 350 };
    dragFromSourceToDest(nodeTypes.task, scriptTaskPosition);
    cy.get('[data-test=switch-to-script-task]').click();
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, scriptTaskPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(scriptTaskPosition)
      .click()
      .then($scriptTask => {
        getCrownButtonForElement($scriptTask, 'delete-button').click({ force: true });
      });

    const exclusiveGatewayPosition = { x: 450, y: 350 };
    dragFromSourceToDest(nodeTypes.exclusiveGateway, exclusiveGatewayPosition);
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, exclusiveGatewayPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(exclusiveGatewayPosition)
      .click()
      .then($exclusiveGateway => {
        getCrownButtonForElement($exclusiveGateway, 'delete-button').click({ force: true });
      });

    const parallelGatewayPosition = { x: 450, y: 350 };
    addNodeTypeToPaper(parallelGatewayPosition, nodeTypes.exclusiveGateway, 'switch-to-parallel-gateway');
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, parallelGatewayPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(parallelGatewayPosition)
      .click()
      .then($parallelGateway => {
        getCrownButtonForElement($parallelGateway, 'delete-button').click({ force: true });
      });

    const inclusiveGatewayPosition = { x: 450, y: 350 };
    addNodeTypeToPaper(inclusiveGatewayPosition, nodeTypes.exclusiveGateway, 'switch-to-inclusive-gateway');
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, inclusiveGatewayPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(inclusiveGatewayPosition)
      .click()
      .then($inclusiveGateway => {
        getCrownButtonForElement($inclusiveGateway, 'delete-button').click({ force: true });
      });

    const secondEventBasedGatewayPosition = { x: 450, y: 350 };
    addNodeTypeToPaper(secondEventBasedGatewayPosition, nodeTypes.exclusiveGateway, 'switch-to-event-based-gateway');
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, secondEventBasedGatewayPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(secondEventBasedGatewayPosition)
      .click()
      .then($eventBasedGateway => {
        getCrownButtonForElement($eventBasedGateway, 'delete-button').click({ force: true });
      });

    const textAnnotationPosition = { x: 450, y: 350 };
    dragFromSourceToDest(nodeTypes.textAnnotation, textAnnotationPosition);
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, textAnnotationPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(textAnnotationPosition)
      .click()
      .then($textAnnotation => {
        getCrownButtonForElement($textAnnotation, 'delete-button').click({ force: true });
      });
  });

  it('Only convert to event based gateway with valid outgoing', () => {
    const startEventPosition = { x: 150, y: 150 };
    connectNodesWithFlow('generic-flow-button', startEventPosition, eventBasedGatewayPosition);
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-parallel-gateway]').click();
    modalConfirm();
    waitToRenderAllShapes();

    const taskPosition = { x: 500, y: 250 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, taskPosition);
    getElementAtPosition(eventBasedGatewayPosition).click();

    // Convert to event-based-gateway must be disabled
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('li:has([data-test=switch-to-event-based-gateway])').trigger('mouseenter', {force: true});
    cy.get('[data-test=switch-to-event-based-gateway]').should('be.disabled');
  });

  it('When convert to Event Based Gateway it should not have the property default', () => {
    const startEventPosition = { x: 150, y: 150 };
    const eventOnePosition = { x: 450, y: 250 };
    const eventTwoPosition = { x: 250, y: 450 };
    addNodeTypeToPaper(eventOnePosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-timer-catch-event');
    addNodeTypeToPaper(eventTwoPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-timer-catch-event');

    connectNodesWithFlow('generic-flow-button', startEventPosition, eventBasedGatewayPosition);
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, eventOnePosition);
    connectNodesWithFlow('generic-flow-button', eventBasedGatewayPosition, eventTwoPosition);

    const updatedSequenceFlow = '<bpmn:eventBasedGateway id="node_3" name="Event Based Gateway"><bpmn:incoming>node_7</bpmn:incoming><bpmn:outgoing>node_9</bpmn:outgoing><bpmn:outgoing>node_11</bpmn:outgoing></bpmn:eventBasedGateway>';
    assertDownloadedXmlContainsExpected(updatedSequenceFlow);
  });
});
