import {
  addNodeTypeToPaper,
  connectNodesWithFlow,
  clickAndDropElement,
  getElementAtPosition, getTinyMceEditor,
  waitToRenderAllShapes,
  waitToRenderNodeUpdates,
  modalConfirm,
  toggleInspector,
  removeStartEvent,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Validation', { scrollBehavior: false }, () => {
  const validateButtonSelector = '[data-cy="validate-button"]';
  const validateButtonIssueSelector = '[data-cy="validate-issue-button"]';
  const validatePanelSelector = '[data-cy="validate-panel"]';

  beforeEach(() => {
    toggleInspector();
  });

  it('Validates gateway direction', () => {
    const gatewayPosition = { x: 350, y: 250 };
    clickAndDropElement(nodeTypes.exclusiveGateway, gatewayPosition);
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-inclusive-gateway]').click();
    modalConfirm();

    cy.get(validateButtonSelector).click({ force: true });
    cy.get(validateButtonIssueSelector).click();

    cy.get(validatePanelSelector).should($list => {
      expect($list).to.contain('Gateway must have multiple outgoing Sequence Flows');
    });

    cy.get(validateButtonIssueSelector).click();

    getElementAtPosition(gatewayPosition).click();

    cy.contains('Advanced').click();
    cy.get('[name=gatewayDirection]').select('Converging');

    waitToRenderNodeUpdates();

    cy.get(validateButtonIssueSelector).click();

    cy.get(validatePanelSelector).should($list => {
      expect($list).to.contain('Gateway must have multiple incoming Sequence Flows');
    });
  });

  it('does not have forEach validation errors after emptying documentation', () => {
    const startEventPosition = { x: 210, y: 200 };
    getElementAtPosition(startEventPosition).click();

    cy.contains('Documentation').click();
    getTinyMceEditor().type('Test');
    getTinyMceEditor().clear();

    cy.get(validateButtonSelector).click({ force: true });
    cy.get(validateButtonIssueSelector).click({ force: true });

    cy.get(validatePanelSelector).should('not.contain', 'Cannot read property \'forEach\' of undefined.');
  });

  it('updates validation after undo/redo', () => {
    cy.get(validateButtonSelector).click({ force: true });
    cy.get(validateButtonIssueSelector).click();

    const initialNumberOfDefinitionListElements = 2;
    cy.get(validatePanelSelector).children().should('have.length', initialNumberOfDefinitionListElements);

    const startEventPosition = { x: 210, y: 200 };

    getElementAtPosition(startEventPosition)
      .then($startEvent => $startEvent.find('.joint-highlight-stroke'))
      .should('have.attr', 'stroke', '#FF0000');

    const taskPosition = { x: 350, y: 300 };
    clickAndDropElement(nodeTypes.task, taskPosition);

    const numberOfNewDefinitionListElements = 1;
    cy.get(validatePanelSelector).children()
      .should('have.length', initialNumberOfDefinitionListElements + numberOfNewDefinitionListElements)
      .should('contain', 'node_2');

    cy.get('[data-cy="undo-control"]').click();
    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition)
      .then($startEvent => $startEvent.find('.joint-highlight-stroke'))
      .should('have.attr', 'stroke', '#FF0000');

    cy.get(validatePanelSelector).children()
      .should('have.length', initialNumberOfDefinitionListElements)
      .should('not.contain', 'node_2');

    cy.get('[data-cy="redo-control"]').click();
    waitToRenderAllShapes();

    cy.get(validatePanelSelector).children()
      .should('have.length', initialNumberOfDefinitionListElements + numberOfNewDefinitionListElements)
      .should('contain', 'node_2');

    getElementAtPosition(startEventPosition)
      .then($startEvent => $startEvent.find('.joint-highlight-stroke'))
      .should('have.attr', 'stroke', '#FF0000');

    getElementAtPosition(taskPosition)
      .then($task => $task.find('.joint-highlight-stroke'))
      .should('have.attr', 'stroke', '#FF0000');
  });

  it('Does not display a console error on multiple validation errors for one node', () => {
    removeStartEvent();
    cy.window().then((win) => {
      cy.spy(win.console, 'error');
    });

    const taskPosition1 = { x: 350, y: 100 };
    const taskPosition2 = { x: 350, y: 300 };
    const taskPosition3 = { x: 350, y: 450 };
    const parallelGatewayPosition = { x: 200, y: 350 };

    addNodeTypeToPaper(parallelGatewayPosition, nodeTypes.exclusiveGateway, 'switch-to-parallel-gateway');
    clickAndDropElement(nodeTypes.task, taskPosition1);
    clickAndDropElement(nodeTypes.task, taskPosition2);
    clickAndDropElement(nodeTypes.task, taskPosition3);

    connectNodesWithFlow('generic-flow-button', taskPosition1, parallelGatewayPosition);
    connectNodesWithFlow('generic-flow-button', taskPosition2, parallelGatewayPosition);
    connectNodesWithFlow('generic-flow-button', parallelGatewayPosition, taskPosition3);

    cy.get(validateButtonSelector).click({ force: true });
    cy.get(validateButtonIssueSelector).click();

    cy.get(validatePanelSelector)
      .should('contain.text', 'Gateway must have multiple outgoing Sequence Flows.Node ID: node_3');
    cy.get(validatePanelSelector)
      .should('contain.text', 'Gateway must not have multiple incoming Sequence Flows.Node ID: node_3');

    cy.window().then((win) => {
      expect(win.console.error).to.have.callCount(0);
    });
  });

  it('has no validation errors for a valid basic diagram', () => {
    const startEventPosition = { x: 210, y: 200 };
    const taskPosition = { x: 250, y: 350 };
    const endEventPosition = { x: 350, y: 550 };

    clickAndDropElement(nodeTypes.task, taskPosition);
    clickAndDropElement(nodeTypes.endEvent, endEventPosition);

    connectNodesWithFlow('generic-flow-button', startEventPosition, taskPosition);
    connectNodesWithFlow('generic-flow-button', taskPosition, endEventPosition);

    cy.get(validateButtonSelector).click({ force: true });

    cy.get(validateButtonIssueSelector)
      .should('be.visible')
      .then($btn => {
        const issueBadge = $btn.children('.issue-badge');
        expect(issueBadge).to.have.text(0);

      });
  });
});
