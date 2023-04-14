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
  const selectorExclusiveGateway = '[data-type="processmaker.components.nodes.gateway.Shape"]';
  const selectorStartEvent = '[data-type="processmaker.components.nodes.startEvent.Shape"]';

  it('TCP4-2724: Verify that configurations were cloned of Exclusive Gateway', () => {

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Add Exclusive Gateway
    const gatewayPosition = { x: 350, y: 250 };
    dragFromSourceToDest(nodeTypes.exclusiveGateway, gatewayPosition);
    cy.get(selectorStartEvent).first().click();

    //Step 3: Config Exclusive Gateway
    cy.get(selectorExclusiveGateway).first().click();
    cy.get('[name="name"]').clear().type('Exclusive Gateway Test 1');

    //Step 4: Set Description on Documentation
    getIframeDocumnetation().find('p').should('exist').click().type('Documentation to Gateway');

    //Step 5: Clone the element
    cy.get('[data-test="duplicate-button"]').click();

    //Validation 1: Verify that gateway was cloned
    cy.get(selectorExclusiveGateway).eq(1).should('be.visible');

    //Validation 2: Verify that configurations of gateway were cloned
    cy.get(selectorExclusiveGateway).eq(1).click();
    cy.get('[name="name"]').should('have.value','Exclusive Gateway Test 1');
    cy.get('[id="accordion-button-documentation-accordion"]').click();
    getIframeDocumnetation().find('p').should('have.text','Documentation to Gateway');
  });

  it('TCP4-2724: Verify Inclusive,Parallel ,Gateway ', () => {

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Add Exclusive Gateway
    const gatewayPosition = { x: 250, y: 350 };
    dragFromSourceToDest(nodeTypes.exclusiveGateway, gatewayPosition);
    cy.get(selectorStartEvent).first().click();

    //Step 3: Change the Exclusive Gateway to Inclusive Gateway
    selectComponentType(selectorExclusiveGateway,'switch-to-inclusive-gateway');

    //Step 4: Clone the Gateway
    cy.get('[data-test="duplicate-button"]').click();

    //Validation 1: Verify that Inclusive Gateway was cloned
    cy.get(selectorExclusiveGateway).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Inclusive Gateway');
    cy.get('[id="delete-button"]').click({force: true});

    //Step 5: Change the Exclusive Gateway to Parallel Gateway
    selectComponentType(selectorExclusiveGateway,'switch-to-parallel-gateway');

    //Step 6: Clone the Gateway
    cy.get('[data-test="duplicate-button"]').click({force: true});

    //Validation 2: Verify that Parallel Gateway was cloned
    cy.get(selectorExclusiveGateway).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Parallel Gateway');
    cy.get('[id="delete-button"]').click({force: true});

    //Step 7: Change the Exclusive Gateway to Event Based in Gateway
    selectComponentType(selectorExclusiveGateway,'switch-to-event-based-gateway');

    //Step 8: Clone the Gateway
    cy.get('[data-test="duplicate-button"]').click({force: true});

    //Validation 3: Verify that Event Based in Gateway was cloned
    cy.get(selectorExclusiveGateway).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Event Based Gateway');
    cy.get('[id="delete-button"]').click({force: true});
  });

});
