import {
  addNodeTypeToPaper,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getCrownButtonForElement,
  getElementAtPosition,
  getGraphElements,
  typeIntoTextInput,
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
    connectNodesWithFlow('sequence-flow-button', startEventPosition, eventBasedGatewayPosition);

    const intermediateCatchEventPosition = { x: 500, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, intermediateCatchEventPosition);

    const intermediateMessageCatchEventPosition = { x: 500, y: 100 };
    addNodeTypeToPaper(intermediateMessageCatchEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-catch-event');
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, intermediateMessageCatchEventPosition);

    const endEventPosition = { x: 500, y: 350 };
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition);
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, endEventPosition);

    const totalNumberOfValidElements = 8;
    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(endEventPosition)
      .click()
      .then($endEvent => {
        getCrownButtonForElement($endEvent, 'delete-button').click();
      });

    const taskPosition = { x: 450, y: 350 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, taskPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(taskPosition)
      .click()
      .then($task => {
        getCrownButtonForElement($task, 'delete-button').click();
      });

    const scriptTaskPosition = { x: 450, y: 350 };
    dragFromSourceToDest(nodeTypes.scriptTask, scriptTaskPosition);
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, scriptTaskPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(scriptTaskPosition)
      .click()
      .then($scriptTask => {
        getCrownButtonForElement($scriptTask, 'delete-button').click();
      });

    const exclusiveGatewayPosition = { x: 450, y: 350 };
    dragFromSourceToDest(nodeTypes.exclusiveGateway, exclusiveGatewayPosition);
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, exclusiveGatewayPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(exclusiveGatewayPosition)
      .click()
      .then($exclusiveGateway => {
        getCrownButtonForElement($exclusiveGateway, 'delete-button').click();
      });

    const parallelGatewayPosition = { x: 450, y: 350 };
    addNodeTypeToPaper(parallelGatewayPosition, nodeTypes.exclusiveGateway, 'switch-to-parallel-gateway');
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, parallelGatewayPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(parallelGatewayPosition)
      .click()
      .then($parallelGateway => {
        getCrownButtonForElement($parallelGateway, 'delete-button').click();
      });

    const inclusiveGatewayPosition = { x: 450, y: 350 };
    addNodeTypeToPaper(inclusiveGatewayPosition, nodeTypes.exclusiveGateway, 'switch-to-inclusive-gateway');
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, inclusiveGatewayPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(inclusiveGatewayPosition)
      .click()
      .then($inclusiveGateway => {
        getCrownButtonForElement($inclusiveGateway, 'delete-button').click();
      });

    const secondEventBasedGatewayPosition = { x: 450, y: 350 };
    addNodeTypeToPaper(secondEventBasedGatewayPosition, nodeTypes.exclusiveGateway, 'switch-to-event-based-gateway');
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, secondEventBasedGatewayPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(secondEventBasedGatewayPosition)
      .click()
      .then($eventBasedGateway => {
        getCrownButtonForElement($eventBasedGateway, 'delete-button').click();
      });

    const textAnnotationPosition = { x: 450, y: 350 };
    dragFromSourceToDest(nodeTypes.textAnnotation, textAnnotationPosition);
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, textAnnotationPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(textAnnotationPosition)
      .click()
      .then($textAnnotation => {
        getCrownButtonForElement($textAnnotation, 'delete-button').click();
      });
  });
});
