import {
  dragFromSourceToDest,
  connectNodesWithFlow,
  waitToRenderAllShapes,
  getGraphElements,
} from '../../../support/utils';
import { nodeTypes } from '../../../support/constants';

describe('Zoom In/Out Hot keys', () => {
  it('TCP4-2655: Verify that "INSPECTOR RAIL" is not affected by Control --', () => {
    const initialNumberOfElements = 1;

    //Step 1: Drag Start Event
    waitToRenderAllShapes();
    const startEventPosition = { x: 150, y: 150 };
    getGraphElements().should('have.length', initialNumberOfElements);

    //Step 2: Drag Task component
    const taskPosition = { x: 300, y: 130 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    //Step 3: Drag End Event
    const endEventPosition = { x: 500, y: 150 };
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition);

    //Step 4: Connect the Start Event with Task
    connectNodesWithFlow('generic-flow-button', startEventPosition, taskPosition);

    //Step 4: Connect the Task with End Event
    connectNodesWithFlow('generic-flow-button', taskPosition, endEventPosition);

    //Step 5: Click on Form Task
    cy.get('[data-type="processmaker.components.nodes.task.Shape"]').first().click();

    //Step 6: Get heigth of "INSPECTOR RAIL" menu
    cy.get('[data-test="inspector-column"]').should('be.visible')
      .invoke('height').then((val) => {
        const heigth = val;
        //Step 7: Press CONTROL ---
        cy.get('body').type('{ctrl}----');
        cy.get('.scale-value').should('have.text', '60%');
       
        //Validation 1: Verify that heigth "INSPECTOR RAIL" does not change
        cy.get('[data-test="inspector-column"]').should('exist')
          .invoke('height').then((val) => {
            cy.log('heigth initial of INSPECTOR RAIL', heigth);
            cy.log('heigth after Ctrl ----', val);
            expect(val).to.be.equal(heigth);
          });
      });
  });

});
