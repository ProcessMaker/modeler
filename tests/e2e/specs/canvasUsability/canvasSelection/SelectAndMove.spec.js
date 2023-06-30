import { nodeTypes } from '../../../support/constants';
const { clickAndDropElement, getElementAtPosition, waitToRenderAllShapes } = require('../../../support/utils');

describe('Select and Move' , () => {
  it('Elements are selected and moved', () => {
    const explorerX = 200;
    const task1Position = { x: 100 + explorerX, y: 200 };
    clickAndDropElement(nodeTypes.task, task1Position);
    //Step 2: Clicks and drags the mouse over the elements
    waitToRenderAllShapes();
    cy.get('.paper-container').click();
    cy.get('.paper-container').trigger('mousedown', { clientX: 200, clientY: 150 });
    cy.get('.paper-container').trigger('mousemove', { clientX: 600, clientY: 700 });
    cy.get('.paper-container').trigger('mouseup',{ clientX: 600, clientY: 600 });

    //move the elements
    cy.get('.paper-container').trigger('mousedown', { clientX: 380, clientY: 210 });
    cy.get('.paper-container').trigger('mousemove', { clientX: 387, clientY: 220 });
    cy.get('.paper-container').trigger('mousemove', { clientX: 400, clientY: 400 });
    cy.get('.paper-container').trigger('mouseup',{ clientX: 400, clientY: 400 });
    
    getElementAtPosition({x:410, y:410}, nodeTypes.task, 12, 100).then(($task) => {
      const { y } = $task[0].getBoundingClientRect();
      expect(task1Position.y).to.be.lessThan(y);
    });

  });
});
