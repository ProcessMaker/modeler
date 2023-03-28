import {
  createSimpleProcess,
} from '../../../support/utils';

describe('Canvas Selection', () => {
  it('TCP4-2695: Verify that menus options affect to all element selected', () => {

    //Step 1: Drag Start Event
    //Step 2: Drag Task component
    //Step 3: Drag End Event
    //Step 4: Connect the Start Event with Task
    //Step 5: Connect the Task with End Event
    createSimpleProcess();

    //Step 6: Select all elements
    cy.get('.paper-container').click('topLeft');
    cy.get('.paper-container').trigger('mousedown', 'topLeft');
    cy.get('.paper-container').trigger('mousemove', 'bottomRight');
    cy.get('.paper-container').trigger('mouseup',{force: true});

    //Validation 1: Copy option: Verify that this option copy all elements selected
    cy.get('[data-cy="selection-box"]').should('exist');
    cy.get('[role="menu"] > [data-test="copy-button"]').should('be.visible');
    //Pending until copy option is implemented

    //Validation 2: Delete option: Verify that this option delete all elements selected
    cy.get('[data-cy="selection-box"]').should('exist');
    cy.get('[role="menu"] > [data-test="delete-button"]').should('be.visible').click();
    cy.get('[data-cy="selection-box"]').should('not.exist');

    //Validation 2.1: Verify that Start Event was deleted
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').should('not.exist');

    //Validation 2.2: Verify that Task Form was deleted
    cy.get('[data-type="processmaker.components.nodes.task.Shape"]').should('not.exist');

    //Validation 2.3: Verify that End Event was deleted
    cy.get('[data-type="processmaker.components.nodes.endEvent.Shape"]').should('not.exist');
  });
});
