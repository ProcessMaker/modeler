/// <reference types="Cypress" />

describe('Modeler', () => {
  it('Renders the application without errors', () => {
    cy.visit('/');
    cy.get('.navbar').should('contain', 'ProcessMaker Modeler');
  });
});
