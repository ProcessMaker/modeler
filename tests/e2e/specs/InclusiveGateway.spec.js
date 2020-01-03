import {
  addNodeTypeToPaper,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getElementAtPosition,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';
import { gatewayDirection } from '../../../src/components/nodes/gateway/gatewayConfig';

describe('Inclusive Gateway', () => {
  const inclusivePosition = { x: 250, y: 250 };

  beforeEach(() => {
    addNodeTypeToPaper(inclusivePosition, nodeTypes.exclusiveGateway, 'switch-to-inclusive-gateway');
  });

  it('Update inclusive gateway name', () => {
    getElementAtPosition(inclusivePosition).click();
    const testString = 'testing';
    typeIntoTextInput('[name=name]', testString);

    cy.get('[name=name]').should('have.value', testString);
  });

  it('Detects gateway direction of converging or diverging', () => {
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
