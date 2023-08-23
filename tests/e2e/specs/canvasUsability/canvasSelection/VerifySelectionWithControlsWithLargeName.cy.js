import {
  waitToRenderAllShapes,
  getGraphElements,
  selectElementsMouse,
} from '../../../support/utils';

describe('Canvas Selection', () => {
  it('TCP4-2667: Verify selection with controls with large name', () => {
    const initialNumberOfElements = 1;

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Clicks and drags the mouse over the elements

    //Step 3: Get with of rectangle of selection
    cy.get('[data-cy="selection-box"]').should('be.visible')
      .invoke('width').then((val) => {
        const value = val;

        //Step 4: Set a large name in the Start Event
        cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click({ force: true });
        cy.get('[data-cy=inspector-button]').click();
        cy.get('#collapse-inspector-accordion-start-event > :nth-child(1) > .form-group')
          .find('input').should('be.visible').clear().type('New Large Name to Start event');

        //Step 5: Clicks and drags the mouse over the elements

        //Validation 1: Verify the rectangle of the selection cover the element with the large name
        cy.get('[data-cy="selection-box"]').should('exist')
          .invoke('width').then((val) => {
            cy.log('with initial of rectangle', value);
            cy.log('with with of rectangle with large name ', val);
            expect(val).to.be.greaterThan(value);
          });
      });
  });
});
