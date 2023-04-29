import {
  dragFromSourceToDest,
  waitToRenderAllShapes,
  getGraphElements, getIframeDocumnetation, selectComponentType,
} from '../../../support/utils';
import { nodeTypes } from '../../../support/constants';

describe('Clone Improvement', () => {
  const initialNumberOfElements = 1;
  const selectorIntermediateEvent = '[data-type="processmaker.components.nodes.intermediateEvent.Shape"]';
  const selectorStartEvent = '[data-type="processmaker.components.nodes.startEvent.Shape"]';

  it('TCP4-2725: Verify that configurations were cloned of Intermediate Event', () => {

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Add Intermediate Event
    const intermediatePosition = { x: 350, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediatePosition);

    //Step 3: Config The Intermediate Event
    cy.get('[name="name"]').clear().type('Intermediate Event Test 1');

    //Step 4: Set Description on Documentation
    getIframeDocumnetation().find('p').should('exist').click().type('Documentation to Intermediate Event');

    //Step 5: Clone the element
    cy.get('[data-test="clone-button"]').click();

    //Validation 1: Verify that Intermediate event was cloned
    cy.get(selectorIntermediateEvent).eq(1).should('be.visible');

    //Validation 2: Verify that configurations of gateway were cloned
    cy.get(selectorIntermediateEvent).eq(1).click();
    cy.get('[name="name"]').should('have.value','Intermediate Event Test 1');
    cy.get('[id="accordion-button-documentation-accordion"]').click();
    getIframeDocumnetation().find('p').should('have.text','Documentation to Intermediate Event');
  });

  it('TCP4-2725: Verify Signal, Conditional and Message End event', () => {

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Add Intermediate Event
    const intermediatePosition = { x: 350, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediatePosition);
    cy.get(selectorStartEvent).first().click();

    //Step 3: Change the Intermediate Event to Signal Event
    selectComponentType(selectorIntermediateEvent,'switch-to-intermediate-signal-catch-event');

    //Step 4: Clone the Intermediate Event
    cy.get('[data-test="clone-button"]').click();

    //Validation 1: Verify that Intermediate Event was cloned
    cy.get(selectorIntermediateEvent).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Intermediate Signal Catch Event');
    cy.get('[id="delete-button"]').click({force: true});

    //Step 5: Change the Intermediate Event to Message Intermediate Event
    selectComponentType(selectorIntermediateEvent,'switch-to-intermediate-message-catch-event');

    //Step 6: Clone the Intermediate Event
    cy.get('[data-test="clone-button"]').click({force: true});

    //Validation 2: Verify that Intermediate Message Event was cloned
    cy.get(selectorIntermediateEvent).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Intermediate Message Catch Event');
    cy.get('[id="delete-button"]').click({force: true});

    //Step 7: Change the Intermediate Event to Intermediate Conditional Event
    selectComponentType(selectorIntermediateEvent,'switch-to-intermediate-conditional-catch-event');

    //Step 8: Clone the Intermediate Event
    cy.get('[data-test="clone-button"]').click({force: true});

    //Validation 3: Verify that Intermediate Conditional Event was cloned
    cy.get(selectorIntermediateEvent).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Intermediate Conditional Catch Event');
    cy.get('[id="delete-button"]').click({force: true});
  });

});
