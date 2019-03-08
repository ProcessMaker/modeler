import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
  waitToRenderAllShapes,
  connectNodesWithFlow,
  getGraphElements,
  getCrownButtonForElement,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Event-based Gateway', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update event-based gateway name', () => {
    const testString = 'testing';

    const eventBasedGatewayPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.eventBasedGateway, eventBasedGatewayPosition);

    waitToRenderAllShapes();
    getElementAtPosition(eventBasedGatewayPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Only have one incoming flow', () => {
    const eventBasedGatewayPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.eventBasedGateway, eventBasedGatewayPosition);

    const startEventPosition = { x: 150, y: 150 };
    connectNodesWithFlow('sequence-flow-button', startEventPosition, eventBasedGatewayPosition);

    const taskPosition = { x: 350, y: 350 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).click();

    connectNodesWithFlow('sequence-flow-button', taskPosition, eventBasedGatewayPosition);

    const totalNumberOfElements = 4;
    getGraphElements().should('have.length', totalNumberOfElements);
  });

  it('Only can connect to one intermediate timer event', () => {
    const eventBasedGatewayPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.eventBasedGateway, eventBasedGatewayPosition);

    const startEventPosition = { x: 150, y: 150 };
    connectNodesWithFlow('sequence-flow-button', startEventPosition, eventBasedGatewayPosition);

    const intermediateCatchEventPosition = { x: 350, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);

    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, intermediateCatchEventPosition);

    const secondIntermediateCatchEventPosition = { x: 500, y: 350 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, secondIntermediateCatchEventPosition);

    waitToRenderAllShapes();

    const totalNumberOfValidElements = 6;
    getGraphElements().should('have.length', totalNumberOfValidElements);

    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, secondIntermediateCatchEventPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);
  });

  it('Only connect to intermediate timer event', () => {
    const eventBasedGatewayPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.eventBasedGateway, eventBasedGatewayPosition);

    const startEventPosition = { x: 150, y: 150 };
    connectNodesWithFlow('sequence-flow-button', startEventPosition, eventBasedGatewayPosition);

    const intermediateCatchEventPosition = { x: 350, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);

    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, intermediateCatchEventPosition);

    const endEventPosition = { x: 450, y: 350 };
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition);
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, endEventPosition);

    const totalNumberOfValidElements = 6;
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
    dragFromSourceToDest(nodeTypes.parallelGateway, parallelGatewayPosition);
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, parallelGatewayPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(parallelGatewayPosition)
      .click()
      .then($parallelGateway => {
        getCrownButtonForElement($parallelGateway, 'delete-button').click();
      });

    const inclusiveGatewayPosition = { x: 450, y: 350 };
    dragFromSourceToDest(nodeTypes.inclusiveGateway, inclusiveGatewayPosition);
    connectNodesWithFlow('sequence-flow-button', eventBasedGatewayPosition, inclusiveGatewayPosition);

    getGraphElements().should('have.length', totalNumberOfValidElements);

    getElementAtPosition(inclusiveGatewayPosition)
      .click()
      .then($inclusiveGateway => {
        getCrownButtonForElement($inclusiveGateway, 'delete-button').click();
      });

    const secondEventBasedGatewayPosition = { x: 450, y: 350 };
    dragFromSourceToDest(nodeTypes.eventBasedGateway, secondEventBasedGatewayPosition);
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
