import { connectNodesWithFlow, dragFromSourceToDest, getElementAtPosition, typeIntoTextInput } from '../support/utils';

import { nodeTypes } from '../support/constants';
import { gatewayDirection } from '../../../src/components/nodes/gateway/gatewayConfig';

describe('Inclusive Gateway', () => {
  it('Update inclusive gateway name', () => {
    const inclusivePosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.inclusiveGateway, inclusivePosition);

    getElementAtPosition(inclusivePosition).click();

    const testString = 'testing';
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Detects gateway direction of converging or diverging', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const inclusivePosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.inclusiveGateway, inclusivePosition);

    const startEventPosition = { x: 150, y: 150 };

    connectNodesWithFlow('sequence-flow-button', startEventPosition, inclusivePosition);

    const divergingString = `gatewayDirection="${gatewayDirection.diverging}"`;
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('have', divergingString);

    const taskPosition = { x: 350, y: 350 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', taskPosition, inclusivePosition);

    getElementAtPosition(taskPosition).click();

    const convergingString = `gatewayDirection="${gatewayDirection.converging}"`;
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('to.contain', convergingString);
  });
});
