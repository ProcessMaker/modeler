describe('Explorer Rail Tests', () => {
  it('Should pin an element', () => {
    // Try with Start Event
    cy.get('[data-test=processmaker-modeler-start-event] > .pinIcon').click();
    cy.wait(300);
    cy.get('.objectCategory').find('[data-test=processmaker-modeler-start-event]').should('not.exist');
    cy.get('.pinnedObjects').find('[data-test=processmaker-modeler-start-event]').should('exist');
    cy.get('.control-list > [data-test=processmaker-modeler-start-event-main]').should('exist');

    // Try with End Event
    cy.get('[data-test=processmaker-modeler-end-event] > .pinIcon').click();
    cy.wait(300);
    cy.get('.objectCategory').find('[data-test=processmaker-modeler-end-event]').should('not.exist');
    cy.get('.pinnedObjects').find('[data-test=processmaker-modeler-end-event]').should('exist');
    cy.get('.control-list > [data-test=processmaker-modeler-end-event-main]').should('exist');
  }),
  it('Should unpin element',() => {
    // Pin a Start Event and End Event first
    cy.get('[data-test=processmaker-modeler-start-event] > .pinIcon').click();
    cy.wait(300);
    cy.get('[data-test=processmaker-modeler-end-event] > .pinIcon').click();
    cy.wait(300);

    // Unpin
    cy.get('[data-test=processmaker-modeler-start-event] > .pinIcon').click();
    cy.wait(300);
    cy.get('.objectCategory').find('[data-test=processmaker-modeler-start-event]').should('exist');
    if (document.getElementsByClassName('.pinnedNodes').length > 0) {
      cy.get('.pinnedNodes').find('[data-test=processmaker-modeler-start-event]').should('not.exist');
    } else {
      cy.get('.node-types__container').find('.pinnedNodes').should('not.exist');
    }
    cy.get('.control-list > [data-test=processmaker-modeler-start-event-main]').should('not.exist');

    cy.get('[data-test=processmaker-modeler-end-event] > .pinIcon').click();
    cy.wait(300);
    cy.get('.objectCategory').find('[data-test=processmaker-modeler-end-event]').should('exist');
    if (document.getElementsByClassName('.pinnedNodes').length > 0) {
      cy.get('.pinnedNodes').find('[data-test=processmaker-modeler-end-event]').should('not.exist');
    } else {
      cy.get('.node-types__container').find('.pinnedNodes').should('not.exist');
    }
    cy.get('.control-list > [data-test=processmaker-modeler-end-event-main]').should('not.exist');
  }),
  it('Should open and close the Explorer Rail properly', () => {
    // Close with X icon on top
    cy.get('.close--container').click();
    cy.get('[data-test=body-container]').find('[data-test=explorer-rail]').should('not.exist');
    cy.wait(300);

    // Open again
    cy.get('.control-add').click();
    cy.get('[data-test=body-container]').find('[data-test=explorer-rail]').should('exist');
    cy.wait(300);

    // Close with + button on bottom rail
    cy.get('.control-add').click();
    cy.get('[data-test=body-container]').find('[data-test=explorer-rail]').should('not.exist');
  });
  it('Should close the Explorer Rail with all pinned elements and open with the same elements', () => {
    // Pin items
    cy.get('[data-test=processmaker-modeler-start-event] > .pinIcon').click();
    cy.wait(300);
    cy.get('[data-test=processmaker-modeler-end-event] > .pinIcon').click();
    cy.wait(300);

    // Close with + button on bottom rail
    cy.get('.control-add').click();
    cy.wait(300);
    cy.get('[data-test=body-container]').find('[data-test=explorer-rail]').should('not.exist');

    cy.get('.control-list > [data-test=processmaker-modeler-start-event-main]').should('exist');
    cy.get('.control-list > [data-test=processmaker-modeler-end-event-main]').should('exist');

    // Open again
    cy.get('.control-add').click();
    cy.get('[data-test=body-container]').find('[data-test=explorer-rail]').should('exist');
    cy.wait(300);

    cy.get('.pinnedObjects').find('[data-test=processmaker-modeler-start-event]').should('exist');
    cy.get('.pinnedObjects').find('[data-test=processmaker-modeler-end-event]').should('exist');

  });
});
