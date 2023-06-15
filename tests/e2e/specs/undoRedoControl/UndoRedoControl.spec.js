import { nodeTypes } from '../../support/constants';
import {
  clickAndDropElement,
  waitToRenderAllShapes,
  getGraphElements,
  getElementAtPosition,
  getCrownButtonForElement,
  getLinksConnectedToElement,
  testNumberOfVertices,
  connectNodesWithFlow,
  setBoundaryEvent,
} from '../../support/utils';

describe('Undo/Redo control test', () => {
  const undoSelector = '[data-cy="undo-control"]';
  const redoSelector = '[data-cy="redo-control"]';

  const buttonBgColorDefault = 'rgb(255, 255, 255)';
  const iconFillColorDefault = 'rgb(51, 51, 68)';

  it('should render new undo/redo controls', () => {
    cy.get(undoSelector)
      .should('be.visible')
      .then($btn => {
        // Checks button style
        expect($btn).to.have.css('background-color', buttonBgColorDefault);

        // Checks button icon style
        const icon = $btn.children('svg');
        expect(icon).to.have.css('fill', iconFillColorDefault);
      });

    cy.get(redoSelector)
      .should('be.visible')
      .then($btn => {
        // Checks button style
        expect($btn).to.have.css('background-color', buttonBgColorDefault);

        // Checks button icon style
        const icon = $btn.children('svg');
        expect(icon).to.have.css('fill', iconFillColorDefault);
      });
  });

  it('should undo/redo adding a task', () => {
    const taskPosition = { x: 300, y: 300 };

    clickAndDropElement(nodeTypes.task, taskPosition);

    cy.get(undoSelector).click();
    waitToRenderAllShapes();

    // Only the start element should remain
    getGraphElements().should('have.length', 1);

    cy.get(redoSelector).click();
    waitToRenderAllShapes();

    // The task should now be re-added
    getGraphElements().should('have.length', 2);
  });

  it('should undo/redo deleting a task', () => {
    const taskPosition = { x: 300, y: 300 };

    clickAndDropElement(nodeTypes.task, taskPosition);

    getElementAtPosition(taskPosition)
      .click()
      .then($task => {
        getCrownButtonForElement($task, 'delete-button').click();
      });

    // Only the start element should remain
    getGraphElements().should('have.length', 1);

    cy.get(undoSelector).click();

    waitToRenderAllShapes();

    // The task should now be re-added
    getGraphElements().should('have.length', 2);
  });

  it('should undo/redo modifying sequence flow vertices', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 300, y: 300 };

    clickAndDropElement(nodeTypes.task, taskPosition);
    connectNodesWithFlow('generic-flow-button', startEventPosition, taskPosition);

    const initialNumberOfWaypoints = 4;
    testNumberOfVertices(initialNumberOfWaypoints);

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click('topRight', { force: true });

    waitToRenderAllShapes();

    cy.get('[data-tool-name=vertices]').trigger('mousedown', 'topRight');
    cy.get('[data-tool-name=vertices]').trigger('mousemove', 'bottomLeft', { force: true });
    cy.get('[data-tool-name=vertices]').trigger('mouseup', 'bottomLeft', { force: true });

    waitToRenderAllShapes();

    const updatedNumberOfWaypoints = 8;
    testNumberOfVertices(updatedNumberOfWaypoints);

    cy.get(undoSelector).click({ force: true });

    waitToRenderAllShapes();

    testNumberOfVertices(initialNumberOfWaypoints);
  });

  it('should undo/redo boundary timer event', () => {
    const taskPosition = { x: 200, y: 200 };
    clickAndDropElement(nodeTypes.task, taskPosition);

    setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);

    const initialNumberOfElements = 3;
    const numberOfElementsToRemove = 1;

    getGraphElements().should('have.length', initialNumberOfElements);

    cy.get(undoSelector).click({ force: true });
    waitToRenderAllShapes();

    getGraphElements().should('have.length', initialNumberOfElements - numberOfElementsToRemove);

    cy.get(redoSelector).click({ force: true });
    waitToRenderAllShapes();

    getGraphElements().should('have.length', initialNumberOfElements);
  });
});
