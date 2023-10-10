import {
  clickAndDropElement,
  createProcess,
  waitToRenderAllShapes,
  connectNodesWithFlow,
} from '../../support/utils';
import { nodeTypes } from '../../support/constants';

describe('Recalculations Issues', () => {
  it('Verify Elements with connector are not moved out of the Pool container: FOUR-8651', () => {

    const endEventSelector = '[data-type="processmaker.components.nodes.endEvent.Shape"]';
    const taskSelector = '[data-type="processmaker.components.nodes.task.Shape"]';
    const poolSelector = '[data-type="processmaker.modeler.bpmn.pool"]';

    //Step 1: Delete Start Event
    cy.get('[data-type="processmaker.components.nodes.startEvent.Shape"]').first().click();
    cy.get('[id="delete-button"]').should('be.visible').click();

    //Step 2: Add Pool
    let poolPosition = { x: 300, y: 0 };
    clickAndDropElement(nodeTypes.pool,poolPosition);

    //Step 3: Add Lane
    cy.get('[id="lane-below-button"]').should('be.visible').click();

    //Step 4: Create Process Start Event, Task form, Task Form & End Event
    const startEventPosition = { x: 400, y: 150 };
    const taskPosition = { x: 500, y: 200 };
    const endEventPosition = { x: 700, y: 250 };
    const task2Position = { x: 500, y: 450 };
    let parameterList = [
      { element: nodeTypes.startEvent, positionElement:startEventPosition,connector:false },
      { element: nodeTypes.task, positionElement:taskPosition,connector:false },
      { element: nodeTypes.endEvent, positionElement:endEventPosition,connector:false },
      { element: nodeTypes.task, positionElement:task2Position,connector:false },
    ];
    createProcess(parameterList);
    connectNodesWithFlow('generic-flow-button',startEventPosition, taskPosition);
    cy.get('[id="generic-flow-button"]').click();
    cy.get(endEventSelector).first().click();
    cy.get(taskSelector).eq(1).click();
    cy.get('[id="generic-flow-button"]').click();
    cy.get(taskSelector).eq(0).click();
    cy.get('[data-type="standard.Link"]>path:nth-child(1)')
      .should('have.length', 6);
    let lenList = [];
    for (let i = 0; i < 3; i++){
      cy.get('[data-type="standard.Link"]>path:nth-child(1)').eq(i).invoke('attr', 'd')
        .then(val => {
          lenList[i] = val;
          cy.log('This is the coordinates'+ lenList);
        });
    }
    //Step 5: Move any element of the pool
    const taskPositionM = { x:500, y: 220 };
    cy.get(taskSelector).first().click().trigger('mousedown',{ force: true });
    cy.get('.paper-container').trigger('mousemove', taskPositionM);
    cy.get('.paper-container').trigger('mousemove', taskPositionM);
    waitToRenderAllShapes();
    cy.get('.paper-container').trigger('mouseup',taskPositionM);
    waitToRenderAllShapes();

    //Step 6: Move the pool
    poolPosition = { x:300, y: 300 };
    cy.get(poolSelector).first().click({ force: true });
    cy.get(poolSelector).first().trigger('mousedown',{ force: true });
    cy.get('.paper-container').trigger('mousemove', poolPosition);
    cy.get('.paper-container').trigger('mousemove', poolPosition);
    waitToRenderAllShapes();
    cy.get('.paper-container').trigger('mouseup',poolPosition);
    waitToRenderAllShapes();

    //Step 7: Press UNDO button twice
    cy.get('[data-cy="undo-control"]').click({ force: true });
    waitToRenderAllShapes();
    cy.get('[data-cy="undo-control"]').click({ force: true });
    waitToRenderAllShapes();

    let lenList2 = [];
    for (let i = 0; i < 3; i++){
      cy.get('[data-type="standard.Link"]>path:nth-child(1)').eq(i).invoke('attr', 'd')
        .then(val => {
          lenList2[i] = val;
          cy.log('This is the coordinates FINAL '+ lenList2);
          let isUndoPosition = !lenList2.map(item => lenList.includes(item)).includes(false);
          expect(isUndoPosition).to.equal(true);
        });
    }
  });
});
