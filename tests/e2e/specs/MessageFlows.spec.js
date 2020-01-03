import {
  connectNodesWithFlow,
  dragFromSourceToDest,
  getCrownButtonForElement,
  getElementAtPosition,
  getLinksConnectedToElement,
  getNumberOfLinks,
  isElementCovered,
  moveElement,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Message Flows', () => {
  it('Can connect two pools with a message flow', () => {
    const pool1Position = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.pool, pool1Position);

    const pool2Position = { x: 250, y: 500 };
    dragFromSourceToDest(nodeTypes.pool, pool2Position);

    connectNodesWithFlow('message-flow-button', pool1Position, pool2Position, 'top');

    moveElement(pool1Position, 300, 300);
    moveElement(pool1Position, 250, 250);

    const numberOfMessageFlowsAdded = 1;
    getElementAtPosition(pool2Position)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links.length).to.eq(numberOfMessageFlowsAdded);
      });
  });

  it('Can connect elements in pools with a message flow', () => {
    const pool1Position = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.pool, pool1Position);

    const pool2Position = { x: 250, y: 500 };
    dragFromSourceToDest(nodeTypes.pool, pool2Position);

    const offset = 100;
    const taskPosition = { x: pool2Position.x + offset, y: pool2Position.y + offset };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const startEventPosition = { x: 150, y: 150 };
    connectNodesWithFlow('message-flow-button', startEventPosition, taskPosition);

    const numberOfMessageFlowsAdded = 1;
    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links.length).to.eq(numberOfMessageFlowsAdded);
      });
  });

  it('Can connect pool to a task in a different pool', () => {
    const pool1Position = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.pool, pool1Position);

    const pool2Position = { x: 250, y: 500 };
    dragFromSourceToDest(nodeTypes.pool, pool2Position);

    const offset = 100;
    const taskPosition = { x: pool2Position.x + offset, y: pool2Position.y + offset };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('message-flow-button', pool1Position, taskPosition);

    const numberOfMessageFlowsAdded = 1;
    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links.length).to.eq(numberOfMessageFlowsAdded);
      });
  });

  it('Cannot connect to itself', () => {
    const startEventPosition = { x: 150, y: 150 };

    const poolPosition = { x: 100, y: 150 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const offset = 100;
    const taskPosition = { x: poolPosition.x + offset, y: poolPosition.y + offset };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    cy.get('[data-test=switch-to-user-task').click();

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });

    const poolHeight = 300;
    const poolLanePosition = { x: poolPosition.x + 100, y: poolPosition.y + poolHeight };

    getNumberOfLinks().should('equal', 0);

    connectNodesWithFlow('message-flow-button', poolPosition, poolPosition);
    connectNodesWithFlow('message-flow-button', poolPosition, startEventPosition);
    connectNodesWithFlow('message-flow-button', poolPosition, taskPosition);
    connectNodesWithFlow('message-flow-button', poolPosition, poolLanePosition);

    connectNodesWithFlow('message-flow-button', startEventPosition, startEventPosition);
    connectNodesWithFlow('message-flow-button', startEventPosition, poolPosition);
    connectNodesWithFlow('message-flow-button', startEventPosition, taskPosition);
    connectNodesWithFlow('message-flow-button', startEventPosition, poolLanePosition);

    connectNodesWithFlow('message-flow-button', taskPosition, taskPosition);
    connectNodesWithFlow('message-flow-button', taskPosition, poolPosition);
    connectNodesWithFlow('message-flow-button', taskPosition, startEventPosition);
    connectNodesWithFlow('message-flow-button', taskPosition, poolLanePosition);

    getNumberOfLinks().should('equal', 0);
  });

  it('Adding a pool and lanes does not overlap message flow', () => {
    const poolPosition = { x: 150, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const poolTwoPosition = { x: 150, y: 600 };
    dragFromSourceToDest(nodeTypes.pool, poolTwoPosition);

    const taskPosition = { x: 200, y: 600 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const startEventPosition = { x: 150, y: 150 };
    connectNodesWithFlow('message-flow-button', startEventPosition, taskPosition);

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .then(isElementCovered).should(isCovered => expect(isCovered).to.be.false);


    getElementAtPosition(poolTwoPosition)
      .click({ force: true })
      .then($pool => getCrownButtonForElement($pool, 'lane-above-button')).click({ force: true });

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .then(isElementCovered).should(isCovered => expect(isCovered).to.be.false);
  });
});
