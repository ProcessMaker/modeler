import {
  clickAndDropElement,
  setBoundaryEvent,
  createProcess,
  selectElements,
  waitToRenderAllShapes,
} from '../../support/utils';
import { nodeTypes } from '../../support/constants';

describe('Recalculations Issues', () => {
  it('Verify Elements wit Boundary are moved out of the Pool container: FOUR-8675', () => {

    const endEventSelector = '[data-type="processmaker.components.nodes.endEvent.Shape"]';
    const boundaryEvent = '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';

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

    //Step 3: Add Pool
    const poolPosition = { x: 400, y: 200 };
    clickAndDropElement(nodeTypes.pool,poolPosition);

    //Step 4: Select the process inside the loop
    parameterList = [
      { element: endEventSelector, pos:0 },
      { element: boundaryEvent, pos:0 },
    ];
    selectElements(parameterList);

    cy.get(endEventSelector).eq(0).invoke('attr', 'transform')
      .then(val => {
        const positionA = val;
        cy.log('this is the current position: ', positionA);

        //Step 5: Move the selection out the pool toward bottom
        cy.get(endEventSelector).eq(0).trigger('mousedown',{ force: true });
        cy.get('.paper-container').trigger('mousemove', 'right');
        cy.get('.paper-container').trigger('mousemove', 'right');
        waitToRenderAllShapes();
        cy.get('.paper-container').trigger('mouseup','right');
        waitToRenderAllShapes();

        //Step 6: Verify that End Event is not out the pool
        cy.get(endEventSelector).eq(0).invoke('attr', 'transform')
          .then(val => {
            const positionB = val;
            cy.log('this is the second position: ', positionB);
            expect(positionA).equal(positionB);
          });
      });
  });
});
