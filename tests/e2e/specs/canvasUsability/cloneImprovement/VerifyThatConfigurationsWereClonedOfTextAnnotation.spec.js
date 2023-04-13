import {
  waitToRenderAllShapes,
  getGraphElements,
  getIframeDocumnetation,
  dragFromSourceToDest,
} from '../../../support/utils';
import {nodeTypes} from "../../../support/constants";

describe('Clone Improvement', () => {
  const initialNumberOfElements = 1;
  const selectorStartEvent = '[data-type="processmaker.components.nodes.startEvent.Shape"]';
  const selectorTextAnnotation = '[data-type="textAnnotation"]';

  it('TCP4-2728: Verify that configurations were cloned of Text Annotation ', () => {

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    const startEventPosition = { x: 150, y: 150 };
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Drag Text Annotation
    const textAnnotationPosition = { x: 350, y: 250 };
    dragFromSourceToDest(nodeTypes.textAnnotation, textAnnotationPosition);
    cy.get(selectorStartEvent).first().click();

    //Step 3: Set title in Text Annotation
    cy.get(selectorTextAnnotation).first().click();
    cy.get('[name="text"]').should('be.visible').clear().type('Text Annotation Test 1');

    //Step 4: Set Description on Documentation
    getIframeDocumnetation().find('p').should('exist').click().type('Documentation to Text Annotation');

    //Step 5: Change color to Text Annotation
    cy.get('[data-test="picker-dropdown-button"]').click();
    cy.get('[class="element-list color-list"]>button:nth-child(1)').click();

    //Step 6: Clone the element
    cy.get('[data-test="duplicate-button"]').click();

    //Validation 1: Verify that Start Event was cloned successfully
    cy.get(selectorTextAnnotation).eq(1).should('be.visible');

    //Validation 2: Verify that configurations of start event were cloned
    cy.get(selectorTextAnnotation).eq(1).click();
    cy.get('[name="text"]').should('have.value','Text Annotation Test 1');
    cy.get('[id="accordion-button-documentation-accordion"]').click();
    getIframeDocumnetation().find('p').should('have.text','Documentation to Text Annotation');
  });
});
