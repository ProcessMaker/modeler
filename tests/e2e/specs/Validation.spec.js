import {
  addNodeTypeToPaper, connectNodesWithFlow,
  dragFromSourceToDest,
  getElementAtPosition,
  waitToRenderAllShapes,
  waitToRenderNodeUpdates,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Validation', () => {

  it('Validates gateway direction', () => {
    const gatewayPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.exclusiveGateway, gatewayPosition);
    cy.get('[data-test=switch-to-inclusive-gateway]').click();

    cy.get('[data-test="validation-toggle"]').click({ force: true });
    cy.get('[data-test="validation-list-toggle"]').click();

    cy.get('[data-test=validation-list]').should($lsit => {
      expect($lsit).to.contain('Gateway must have multiple outgoing Sequence Flows');
    });

    cy.get('[data-test=validation-list-toggle]').click();

    getElementAtPosition(gatewayPosition).click();

    cy.contains('Advanced').click();
    cy.get('[name=gatewayDirection]').select('Converging');

    waitToRenderNodeUpdates();

    cy.get('[data-test=validation-list-toggle]').click();

    cy.get('[data-test=validation-list]').should($lsit => {
      expect($lsit).to.contain('Gateway must have multiple incoming Sequence Flows');
    });
  });

  it.only('does not break after emptying documentation #1211', () => {
    // grab start event
    // set and unset documentation
    // re-validate
    // no console errors expected
  });

  it('updates validation after undo/redo', () => {
    cy.get('[data-test=validation-toggle]').click({ force: true });
    cy.get('[data-test=validation-list-toggle]').click();

    const initialNumberOfDefinitionListElements = 4;
    cy.get('[data-test=validation-list]').children().should('have.length', initialNumberOfDefinitionListElements);

    const startEventPosition = { x: 150, y: 150 };

    getElementAtPosition(startEventPosition).then($startEvent => {
      cy.wrap($startEvent).find('[stroke=red]').should('exist');
    });

    const taskPosition = { x: 150, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const numberOfNewDefinitionListElements = 2;
    cy.get('[data-test=validation-list]').children()
      .should('have.length', initialNumberOfDefinitionListElements + numberOfNewDefinitionListElements)
      .should('contain', 'node_2');

    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition).then($startEvent => {
      cy.wrap($startEvent).find('[stroke=red]').should('exist');
    });

    cy.get('[data-test=validation-list]').children()
      .should('have.length', initialNumberOfDefinitionListElements)
      .should('not.contain', 'node_2');

    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    cy.get('[data-test=validation-list]').children()
      .should('have.length', initialNumberOfDefinitionListElements + numberOfNewDefinitionListElements)
      .should('contain', 'node_2');

    getElementAtPosition(startEventPosition).then($startEvent => {
      cy.wrap($startEvent).find('[stroke=red]').should('exist');
    });

    getElementAtPosition(taskPosition).then($task => {
      cy.wrap($task).find('[stroke=red]').should('exist');
    });
  });

  it('Does not display a console error on multiple validation errors for one node', () => {
    cy.window().then((win) => {
      cy.spy(win.console, 'error');
    });

    const taskPosition1 = { x: 300, y: 250 };
    const taskPosition2 = { x: 300, y: 350 };
    const taskPosition3 = { x: 300, y: 450 };
    const parallelGatewayPosition = { x: 200, y: 200 };

    addNodeTypeToPaper(parallelGatewayPosition, nodeTypes.exclusiveGateway, 'switch-to-parallel-gateway');
    dragFromSourceToDest(nodeTypes.task, taskPosition1);
    dragFromSourceToDest(nodeTypes.task, taskPosition2);
    dragFromSourceToDest(nodeTypes.task, taskPosition3);

    connectNodesWithFlow('sequence-flow-button', taskPosition1, parallelGatewayPosition);
    connectNodesWithFlow('sequence-flow-button', taskPosition2, parallelGatewayPosition);
    connectNodesWithFlow('sequence-flow-button', parallelGatewayPosition, taskPosition3);

    cy.get('[data-test="validation-toggle"]').click({ force: true });
    cy.get('[data-test="validation-list-toggle"]').click();

    cy.get('[data-test=validation-list]')
      .should('contain.text', 'Gateway must have multiple outgoing Sequence Flows.Node ID: node_3');
    cy.get('[data-test=validation-list]')
      .should('contain.text', 'Gateway must not have multiple incoming Sequence Flows.Node ID: node_3');

    cy.window().then((win) => {
      expect(win.console.error).to.have.callCount(0);
    });
  });
});
