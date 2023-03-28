import {
  createSimpleProcess,
} from '../../../support/utils';

describe('Canvas Selection', () => {
  it('TCP4-2694: Verify that menu of the selection does not belong to any selected element', () => {

    //Step 1: Drag Start Event
    //Step 2: Drag Task component
    //Step 3: Drag End Event
    //Step 4: Connect the Start Event with Task
    //Step 5: Connect the Task with End Event
    createSimpleProcess();

    //Step 6: Click on task form
    cy.get('[data-type="processmaker.components.nodes.task.Shape"]').first().click();

    //Validation 1: The menu should be of Form Task
    cy.get('[role="menu"]').should('exist');
    cy.get('[role="menu"] > [id="generic-flow-button"]').should('be.visible');
    cy.get('[role="menu"] >* [data-test="select-type-dropdown"]').should('be.visible');
    cy.get('[role="menu"] >* [data-test="boundary-event-dropdown"]').should('be.visible');
    cy.get('[role="menu"] >* [data-test="picker-dropdown-button"]').should('be.visible');
    cy.get('[role="menu"] > [data-test="copy-button"]').should('be.visible');
    cy.get('[role="menu"] > [id="delete-button"]').should('be.visible');

    //Step 7: Select all elements
    cy.get('.paper-container').click('topLeft');
    cy.get('.paper-container').trigger('mousedown', 'topLeft');
    cy.get('.paper-container').trigger('mousemove', 'bottomRight');
    cy.get('.paper-container').trigger('mouseup',{force: true});

    //Validation 2: The menu should be to all elements selected
    cy.get('[data-cy="selection-box"]').should('exist');
    cy.get('[role="menu"] > [id="generic-flow-button"]').should('not.exist');
    cy.get('[role="menu"] >* [data-test="select-type-dropdown"]').should('not.exist');
    cy.get('[role="menu"] >* [data-test="boundary-event-dropdown"]').should('not.exist');
    cy.get('[role="menu"] >* [data-test="picker-dropdown-button"]').should('not.exist');
    cy.get('[role="menu"] > [data-test="copy-button"]').should('be.visible');
    cy.get('[role="menu"] > [data-test="delete-button"]').should('be.visible');
  });
});
