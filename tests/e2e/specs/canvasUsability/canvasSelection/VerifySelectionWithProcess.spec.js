import {
  dragFromSourceToDest,
  connectNodesWithFlow,
  waitToRenderAllShapes, getGraphElements,
} from '../../../support/utils';
import { nodeTypes } from '../../../support/constants';

describe('Canvas Selection', () => {
  it('TCP4-2666: Verify selection with process', () => {
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

    //Step 5: Clicks and drags the mouse over the elements
    cy.get('.paper-container').trigger('mousedown', 'topLeft');
    cy.get('.paper-container').trigger('mousemove', 'bottomRight');
    cy.get('.paper-container').trigger('mouseup',{force: true});

    //Validation 1: Verify that all element are selected and a rectangle highlights the selected elements
    cy.get('[data-cy="selection-box"]').should('exist');

  });
});
