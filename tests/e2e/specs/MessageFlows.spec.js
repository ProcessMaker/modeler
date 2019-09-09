import {
  dragFromSourceToDest,
  getElementAtPosition,
  connectNodesWithFlow,
  getLinksConnectedToElement,
  moveElement,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Message Flows', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

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

  it('Can connect to task in different pool', () => {
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
});
