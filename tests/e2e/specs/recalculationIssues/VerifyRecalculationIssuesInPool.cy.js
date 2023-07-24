import {
  clickAndDropElement,
  setBoundaryEvent,
  createProcess,
  selectElements,
  waitToRenderAllShapes,
} from '../../support/utils';
import { nodeTypes } from '../../support/constants';

describe('Recalculations Issues', () => {
  it('Verify that Elements are not moved out of the Pool container: FOUR-8393', () => {

    const taskSelector = '[data-type="processmaker.components.nodes.endEvent.Shape"]';
    const boundaryEvent = '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';
    const link = '[data-type="standard.Link"]';
    const endEventSelector = '[data-type="processmaker.components.nodes.task.Shape"]';

    //Step 1: Delete Start Event
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click();
    cy.get('[id="delete-button"]').should('be.visible').click();

    //Step 2: Create Process Task form , End Event & Boundary Event
    const taskPosition = { x: 300, y: 200 };
    let parameterList = [
      { element: nodeTypes.task, positionElement:{ x:300, y: 200 },connector:false },
      { element: nodeTypes.endEvent, positionElement:{ x:550, y: 270 },connector:false },
    ];
    createProcess(parameterList);
    setBoundaryEvent(nodeTypes.boundaryErrorEvent, taskPosition);

    cy.get('[id="generic-flow-button"]').click();
    cy.get('[data-type="processmaker.components.nodes.endEvent.Shape"]').first().click();

    //Step 3: Add Pool
    const poolPosition = { x: 400, y: 200 };
    clickAndDropElement(nodeTypes.pool,poolPosition);

    //Step 4: Select the process inside the loop
    parameterList = [
      { element: taskSelector, pos:0 },
      { element: boundaryEvent, pos:0 },
      { element: link, pos:0 },
      { element: endEventSelector, pos:0 },
    ];
    selectElements(parameterList);

    //Step 5: Clone the Selection
    cy.get('[data-test="clone-button"]').click();

    //Step 6: Move the selection out the pool toward bottom
    cy.get(taskSelector).eq(1).trigger('mousedown',{ force: true });
    cy.get('.paper-container').trigger('mousemove', 'bottom');
    cy.get('.paper-container').trigger('mousemove', 'bottom');
    waitToRenderAllShapes();
    cy.get('.paper-container').trigger('mouseup','bottom');


    //Step 7: Move the selection out the pool toward right
    cy.wait(1000);
    cy.get(taskSelector).eq(1).trigger('mousedown',{ force: true });
    cy.get('.paper-container').trigger('mousemove', 'left');
    cy.get('.paper-container').trigger('mousemove', 'left');
    waitToRenderAllShapes();
    cy.get('.paper-container').trigger('mouseup','left');

    //Step 8: Press UNDO button
    cy.get('[data-cy="undo-control"]').click();

    //Step 9: Verify that the element is not outside the pool
    cy.get(taskSelector).eq(2).should('not.exist');
    cy.get(boundaryEvent).eq(2).should('not.exist');
    cy.get(endEventSelector).eq(2).should('not.exist');
    cy.get(link).eq(2).should('not.exist');
  });
});
