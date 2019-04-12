import {
  dragFromSourceToDest,
  connectNodesWithFlow,
  getElementAtPosition,
  getLinksConnectedToElement,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Sequence Flows', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Can connect two elements', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 250, y: 250 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    const numberOfSequenceFlowsAdded = 1;

    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links.length).to.eq(numberOfSequenceFlowsAdded);
      });
  });

  it('Update Condition expression', () => {
    const exclusiveGatewayPosition = { x: 400, y: 300 };
    dragFromSourceToDest(
      nodeTypes.exclusiveGateway, exclusiveGatewayPosition);

    const taskPosition = { x: 400, y: 500 };
    dragFromSourceToDest(
      nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', exclusiveGatewayPosition, taskPosition);

    getElementAtPosition(exclusiveGatewayPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    const testString = 'foo > 7';
    typeIntoTextInput('[name="conditionExpression.body"]', testString);
    cy.get('[name="conditionExpression.body"]').should('have.value', testString);
  });
});
