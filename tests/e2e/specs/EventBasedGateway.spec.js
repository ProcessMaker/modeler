import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
  waitToRenderAllShapes,
  connectNodesWithFlow,
  getGraphElements,
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
});
