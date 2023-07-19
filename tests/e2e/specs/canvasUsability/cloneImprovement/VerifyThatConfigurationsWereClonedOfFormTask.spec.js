import {
  clickAndDropElement,
  waitToRenderAllShapes,
  getGraphElements, getIframeDocumentation, selectComponentType, toggleInspector,
} from '../../../support/utils';
import { nodeTypes } from '../../../support/constants';

describe('Clone Improvement', () => {
  const initialNumberOfElements = 1;
  const selectorFormTask = '[data-type="processmaker.components.nodes.task.Shape"]';
  const selectorStartEvent = '[data-type="processmaker.components.nodes.startEvent.Shape"]';

  it('TCP4-2727: Verify that configurations were cloned of Form Task', () => {

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Add Task Form
    const taskPosition = { x: 350, y: 250 };
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    toggleInspector();

    //Step 3: Config The Form Task
    cy.get('[data-type="processmaker.components.nodes.task.Shape"]').first().click();
    cy.get('#collapse-inspector-accordion-task > :nth-child(1) > .form-group')
      .find('input').should('be.visible').clear().type('Form Task Test 1');

    //Step 4: Set Description on Documentation
    getIframeDocumentation().find('p').should('exist').click().type('Documentation to Form Task');

    //Step 5: Clone the element
    cy.get('[data-test="clone-button"]').click({force: true});

    //Validation 1: Verify that Task event was cloned
    cy.get(selectorFormTask).eq(1).should('be.visible');

    //Validation 2: Verify that configurations of task were cloned
    cy.get(selectorFormTask).eq(1).click();
    cy.get('[name="name"]').should('have.value','Form Task Test 1');
    cy.get('[id="accordion-button-documentation-accordion"]').click();
    getIframeDocumentation().find('p').should('have.text','Documentation to Form Task');
  });

  it('TCP4-2727: Verify Form Task,Manual Task,Script Task and Sub-Process', () => {
    const initialNumberOfElements = 1;

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Add Form Task
    const intermediatePosition = { x: 350, y: 250 };
    clickAndDropElement(nodeTypes.task, intermediatePosition);
    cy.get(selectorStartEvent).first().click();

    //Step 3: Change the Form Task to Manual Task
    selectComponentType(selectorFormTask,'switch-to-manual-task');

    //Step 4: Clone the Manual Task
    cy.get('[data-test="clone-button"]').click();

    //Validation 1: Verify that Manual was cloned
    cy.get(selectorFormTask).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Manual Task');
    cy.get('[id="delete-button"]').click({force: true});

    //Step 5: Change the Form Task to Script Task
    selectComponentType(selectorFormTask,'switch-to-script-task');

    //Step 6: Clone the Script Task
    cy.get('[data-test="clone-button"]').click({force: true});

    //Validation 2: Verify that Script Task was cloned
    cy.get(selectorFormTask).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Script Task');
    cy.get('[id="delete-button"]').click({force: true});

    //Step 7: Change the Form Task  to Sub-Process
    selectComponentType(selectorFormTask,'switch-to-sub-process');

    //Step 8: Clone the Sub-process
    cy.get('[data-test="clone-button"]').click({force: true});

    //Validation 3: Verify that Sub-process was cloned
    cy.get(selectorFormTask).eq(1).should('be.visible');
    cy.get('[name="name"]').should('have.value','Sub Process');
    cy.get('[id="delete-button"]').click({force: true});
  });
});
