import {
  waitToRenderAllShapes,
  getGraphElements,
  getIframeDocumnetation,
  selectComponentType,
} from '../../../support/utils';

describe('Clone Improvement', () => {
  const initialNumberOfElements = 1;
  const selectorStartEvent = '[data-type="processmaker.components.nodes.startEvent.Shape"]';

  it('TCP4-2717: Verify that configurations were cloned of Start Event ', () => {

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Set Name in Start Event
    cy.get(selectorStartEvent).first().click();
    cy.get('[name="name"]').should('be.visible').clear().type('Start Event Test 1');

    //Step 3: Set Description on Documentation
    getIframeDocumnetation().find('p').should('exist').click().type('Documentation to Start Event');

    //Step 4: Clone the element
    cy.get('[data-test="clone-button"]').click();

    //Validation 1: Verify that Start Event was cloned successfully
    cy.get(selectorStartEvent).eq(1).should('be.visible');

    //Validation 2: Verify that configurations of start event were cloned
    cy.get(selectorStartEvent).eq(1).click();
    cy.get('[name="name"]').should('have.value','Start Event Test 1');
    cy.get('[id="accordion-button-documentation-accordion"]').click();
    getIframeDocumnetation().find('p').should('have.text','Documentation to Start Event');
  });

  it('TCP4-2717: Verify Start Event types: Start Timer Event, Signal Start Event, Message Start Event and Conditioal Start Event', () => {

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Change the Start Event to Start Timer Event
    cy.get(selectorStartEvent).first().click();
    selectComponentType(selectorStartEvent,'switch-to-start-timer-event');

    //Step 3: Clone Start Timer Event
    cy.get('[data-test="clone-button"]').click();

    //Validation 1: Verify that Start Timer Event was cloned
    cy.get(selectorStartEvent).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Start Timer Event');
    cy.get('[id="delete-button"]').click({force: true});

    //Step 4: Change the Start Event to Signal Start Event
    selectComponentType(selectorStartEvent,'switch-to-signal-start-event');

    //Step 5: Clone the Signal Start Event
    cy.get('[data-test="clone-button"]').click();

    //Validation 2: Verify that Signal Start Event was cloned
    cy.get(selectorStartEvent).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Signal Start Event');
    cy.get('[id="delete-button"]').click({force: true});

    //Step 6: Change the Start Event to Message Start Event
    selectComponentType(selectorStartEvent,'switch-to-message-start-event');

    //Step 7: Clone the Message Start Event
    cy.get('[data-test="clone-button"]').click();

    //Validation 3: Verify that Message Start Event was cloned
    cy.get(selectorStartEvent).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Message Start Event');
    cy.get('[id="delete-button"]').click({force: true});

    //Step 8: Change the Start Event to Conditional Start Event
    selectComponentType(selectorStartEvent,'switch-to-conditional-start-event');

    //Step 9: Clone the Conditional Start Event
    cy.get('[data-test="clone-button"]').click();

    //Validation 4: Verify that Conditional Start Event was cloned
    cy.get(selectorStartEvent).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Conditional Start Event');
    cy.get('[id="delete-button"]').click({force: true});
  });

});
