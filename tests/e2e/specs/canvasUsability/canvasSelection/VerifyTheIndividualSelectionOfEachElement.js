import {
  dragFromSourceToDest,
  waitToRenderAllShapes, getGraphElements,
} from '../../../support/utils';
import { nodeTypes } from '../../../support/constants';

describe('Canvas Selection', () => {
  const elementPosition = { x: 350, y: 150 };

  it('TCP4-2662: Verify the individual selection of Start Event', () => {
    const initialNumberOfElements = 1;

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Set a name in Start Event
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click({force: true});
    cy.get('[name="name"]').clear().type('Start event Test 1');

    //Validation 1: Verify that the element is selected ,including its name. and a rectangle highlights the element
    cy.get('[data-cy="selection-box"]').should('exist');
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"] [data-cy="selected"]').should('exist');
  });

  it('TCP4-2662: Verify the individual selection of Intermediate Event', () => {

    //Step 1: Add Start Event
    waitToRenderAllShapes();
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click({force: true});

    //Step 2: Drag Intermediate Event
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, elementPosition);

    //Step 3: Set a name in Intermediate Event
    cy.get('[name="name"]').clear().type('Timer Event Test 1');

    //Step 4: Select the element
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click();
    cy.get('[data-type="processmaker.components.nodes.intermediateEvent.Shape"]').first().click();

    //Validation 2: Verify that the element is selected ,including its name. and a rectangle highlights the element
    cy.get('[data-cy="selection-box"]').should('exist');
    cy.get('[data-type="processmaker.components.nodes.intermediateEvent.Shape"] [data-cy="selected"]').should('exist');
  });

  it('TCP4-2662: Verify the individual selection of End Event', () => {

    //Step 1: Add Start Event
    waitToRenderAllShapes();
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click({force: true});

    //Step 2: Drag End Event
    dragFromSourceToDest(nodeTypes.endEvent, elementPosition);

    //Step 3: Set a name in End Event
    cy.get('[name="name"]').clear().type('End Event Test 1');

    //Step 4: Select the element
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click();
    cy.get('[data-type="processmaker.components.nodes.endEvent.Shape"]').first().click();

    //Validation 3: Verify that the element is selected ,including its name. and a rectangle highlights the element
    cy.get('[data-cy="selection-box"]').should('exist');
    cy.get('[data-type="processmaker.components.nodes.endEvent.Shape"] [data-cy="selected"]').should('exist');
  });

  it('TCP4-2662: Verify the individual selection of Task Form', () => {

    //Step 1: Add Start Event
    waitToRenderAllShapes();
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click({force: true});

    //Step 2: Drag Task Form
    dragFromSourceToDest(nodeTypes.task, elementPosition);

    //Step 3: Set a name in Task Form
    cy.get('[name="name"]').clear().type('Task Test 1');

    //Step 4: Select the element
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click();
    cy.get('[data-type="processmaker.components.nodes.task.Shape"]').first().click();

    //Validation 4: Verify that the element is selected ,including its name. and a rectangle highlights the element
    cy.get('[data-cy="selection-box"]').should('exist');
    cy.get('[data-type="processmaker.components.nodes.task.Shape"] [data-cy="selected"]').should('exist');
  });

  it('TCP4-2662: Verify the individual selection of Gateway', () => {

    //Step 1: Add Start Event
    waitToRenderAllShapes();
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click({force: true});

    //Step 2: Drag Gateway component
    dragFromSourceToDest(nodeTypes.exclusiveGateway, elementPosition);

    //Step 3: Set a name in Gateway Component
    cy.get('[name="name"]').clear().type('Exclusive Gateway Test 1');

    //Step 4: Select the element
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click();
    cy.get('[data-type="processmaker.components.nodes.gateway.Shape"]').first().click();

    //Validation 5: Verify that the element is selected ,including its name. and a rectangle highlights the element
    cy.get('[data-cy="selection-box"]').should('exist');
    cy.get('[data-type="processmaker.components.nodes.gateway.Shape"] [data-cy="selected"]').should('exist');
  });

  it('TCP4-2662: Verify the individual selection of Text Annotation', () => {

    //Step 1: Add Start Event
    waitToRenderAllShapes();
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click({force: true});

    //Step 2: Drag Text Annotation
    dragFromSourceToDest(nodeTypes.textAnnotation, elementPosition);

    //Step 3: Set a name in Text Annotation
    cy.get('[name="text"]').clear().type('Text Annotation Test 1');

    //Step 4: Select the element
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click();
    cy.get('[data-type="textAnnotation"]').first().click();

    //Validation 6: Verify that the element is selected ,including its name. and a rectangle highlights the element
    cy.get('[data-cy="selection-box"]').should('exist');
    cy.get('[data-type="textAnnotation"] [data-cy="selected"]').should('exist');
  });

  it('TCP4-2662: Verify the individual selection of Data Object', () => {

    //Step 1: Add Start Event
    waitToRenderAllShapes();
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click({force: true});

    //Step 2: Drag Data Object
    dragFromSourceToDest(nodeTypes.dataObject, elementPosition);

    //Step 3: Set a name in Data Object
    cy.get('[name="name"]').clear().type('Data Object Test 1');

    //Step 4: Select the element
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click();
    cy.get('[data-type="standard.Path"]').first().click();

    //Validation 7: Verify that the element is selected ,including its name. and a rectangle highlights the element
    cy.get('[data-cy="selection-box"]').should('exist');
    cy.get('[data-type="standard.Path"] [data-cy="selected"]').should('exist');
  });

  it('TCP4-2662: Verify the individual selection of Data Store', () => {

    //Step 1: Add Start Event
    waitToRenderAllShapes();
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click({force: true});

    //Step 2: Drag Data Store
    dragFromSourceToDest(nodeTypes.dataStore, elementPosition);

    //Step 3: Set a name in Data Store
    cy.get('[name="name"]').clear().type('Data Store Test 1');

    //Step 4: Select the element
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click();
    cy.get('[data-type="standard.Cylinder"]').first().click();

    //Validation 8: Verify that the element is selected ,including its name. and a rectangle highlights the element
    cy.get('[data-cy="selection-box"]').should('exist');
    cy.get('[data-type="standard.Cylinder"] [data-cy="selected"]').should('exist');
  });

});
