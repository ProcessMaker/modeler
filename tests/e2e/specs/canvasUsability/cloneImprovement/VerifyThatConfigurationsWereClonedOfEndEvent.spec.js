import {
  dragFromSourceToDest,
  waitToRenderAllShapes,
  getGraphElements,
  getIframeDocumnetation,
  selectComponentType,
} from '../../../support/utils';
import { nodeTypes } from '../../../support/constants';

describe('Clone Improvement', () => {
  const initialNumberOfElements = 1;
  const selectorEndEvent = '[data-type="processmaker.components.nodes.endEvent.Shape"]';
  const selectorStartEvent = '[data-type="processmaker.components.nodes.startEvent.Shape"]';

  it('TCP4-2726: Verify that configurations were cloned of End Event', () => {

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Add End Event
    const endEventPosition = { x: 350, y: 250 };
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition);

    //Step 3: Config The End Event
    cy.get('[name="name"]').clear().type('End Event Test 1');

    //Step 4: Set Description on Documentation
    getIframeDocumnetation().find('p').should('exist').click().type('Documentation to End Event');

    //Step 5: Clone the element
    cy.get('[data-test="clone-button"]').click();

    //Validation 1: Verify that End event was cloned
    cy.get(selectorEndEvent).eq(1).should('be.visible');

    //Validation 2: Verify that configurations of end event were cloned
    cy.get(selectorEndEvent).eq(1).click({force:true});
    cy.get('[name="name"]').should('have.value','End Event Test 1');
    cy.get('[id="accordion-button-documentation-accordion"]').click();
    getIframeDocumnetation().find('p').should('have.text','Documentation to End Event');
  });

  it('TCP4-2726: Verify Message,Error,Signal and Terminate end event', () => {
    const initialNumberOfElements = 1;

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Add End Event
    const endEventPosition = { x: 350, y: 250 };
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition);
    cy.get(selectorStartEvent).first().click();

    //Step 3: Change the End Event to Message End Event
    selectComponentType(selectorEndEvent,'switch-to-message-end-event');

    //Step 4: Clone the End Event
    cy.get('[data-test="clone-button"]').click();

    //Validation 1: Verify that Message End Event was cloned
    cy.get(selectorEndEvent).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Message End Event');
    cy.get('[id="delete-button"]').click({force: true});

    //Step 5: Change the End Event to Error End Event
    selectComponentType(selectorEndEvent,'switch-to-error-end-event');

    //Step 6: Clone the Error End Event
    cy.get('[data-test="clone-button"]').click({force: true});

    //Validation 2: Verify that Error End Event was cloned
    cy.get(selectorEndEvent).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Error End Event');
    cy.get('[id="delete-button"]').click({force: true});

    //Step 7: Change the End Event to Signal End Event
    selectComponentType(selectorEndEvent,'switch-to-signal-end-event');

    //Step 8: Clone the End Event
    cy.get('[data-test="clone-button"]').click({force: true});

    //Validation 3: Verify that Signal End Event was cloned
    cy.get(selectorEndEvent).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Signal End Event');
    cy.get('[id="delete-button"]').click({force: true});

    //Step 9: Change the End Event to Terminate End Event
    selectComponentType(selectorEndEvent,'switch-to-terminate-end-event');

    //Step 8: Clone the End Event
    cy.get('[data-test="clone-button"]').click({force: true});

    //Validation 3: Verify that Terminate End Event was cloned
    cy.get(selectorEndEvent).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Terminate End Event');
    cy.get('[id="delete-button"]').click({force: true});
  });

});
