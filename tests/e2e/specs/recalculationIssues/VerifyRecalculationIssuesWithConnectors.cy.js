import {
  clickAndDropElement, connectNodesWithFlow,
  createProcess,
  selectElements, waitToRenderAllShapes,
} from '../../support/utils';
import { nodeTypes } from '../../support/constants';

describe('Recalculations Issues', () => {
  it('Veriy Elements wit connector are not moved out of the Pool container: FOUR-8674', () => {

    const link = '[data-type="standard.Link"]';
    const endEventSelector = '[data-type="processmaker.components.nodes.endEvent.Shape"]';

    //Step 1: Delete Start Event
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click();
    cy.get('[id="delete-button"]').should('be.visible').click();
    
    const taskPosition = { x: 300, y: 200 };
    const endEventPosition = { x: 500, y: 250 };
    let parameterList = [
      { element: nodeTypes.task, positionElement:taskPosition,connector:false },
      { element: nodeTypes.endEvent, positionElement:endEventPosition,connector:false },
    ];
    createProcess(parameterList);
    connectNodesWithFlow('generic-flow-button',taskPosition, endEventPosition);
      
    //Step 3: Add Pool
    const poolPosition = { x: 400, y: 200 };
    clickAndDropElement(nodeTypes.pool,poolPosition);

    //Step 4: Select the process inside the loop
    parameterList = [
      { element: link, pos:0 },
      { element: endEventSelector, pos:0 },
    ];
    selectElements(parameterList);

    cy.get(endEventSelector).eq(0).invoke('attr', 'transform')
      .then(val => {
        const positionA = val;
        cy.log('this is the current position: ', positionA);

        //Step 5: Move the selection out the pool toward bottom
        cy.get(endEventSelector).eq(0).trigger('mousedown',{ force: true });
        cy.get('.paper-container').trigger('mousemove', 'right', { force: true });
        cy.get('.paper-container').trigger('mousemove', 'right', { force: true });
        waitToRenderAllShapes();
        cy.get('.paper-container').trigger('mouseup','right', { force: true });
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
