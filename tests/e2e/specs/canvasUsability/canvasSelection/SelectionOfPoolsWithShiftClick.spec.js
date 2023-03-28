import {
  dragFromSourceToDest,
  getElementAtPosition,
  waitToRenderAllShapes,
  moveElementRelativeTo,
} from '../../../support/utils';
import { nodeTypes } from '../../../support/constants';

describe('Selection of pool with shift click', () => {
  it('should add to selection a pool with shift key', () => {
    // Drag pool 1 and elements inside
    const pool1Position = { x: 100, y: 50 };
    dragFromSourceToDest(nodeTypes.pool, pool1Position);

    const taskPosition1 = { x: 280, y: 180 };
    const endEventPosition1 = { x: 440, y: 240 };
    dragFromSourceToDest(nodeTypes.task, taskPosition1);
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition1);

    // Drag pool 2 and elements inside
    const pool2Position = { x: 100, y: 450 };
    dragFromSourceToDest(nodeTypes.pool, pool2Position);

    const startEventPosition2 = { x: 180, y: 520 };
    const taskPosition2 = { x: 280, y: 500 };
    const endEventPosition2 = { x: 440, y: 520 };
    dragFromSourceToDest(nodeTypes.startEvent, startEventPosition2);
    dragFromSourceToDest(nodeTypes.task, taskPosition2);
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition2);

    // Select both pools with shift + click
    cy.get('body').type('{shift}', { release: false });
    getElementAtPosition(pool1Position, nodeTypes.pool, 20, 100).click();

    getElementAtPosition(pool2Position, nodeTypes.pool, 12, 100).click();
    cy.get('body').type('{shift}', { release: true });

    // Validate that two pools were selected
    cy.get(
      '[data-type="processmaker.components.nodes.pool.Shape"] [data-cy="selected"]'
    ).should('have.length', 2);

    // Move the selected pools to another position
    const translateAmount = { x: 200, y: 200 };
    moveElementRelativeTo(
      pool1Position,
      translateAmount.x,
      translateAmount.y,
      nodeTypes.pool
    );
    moveElementRelativeTo(
      pool2Position,
      translateAmount.x,
      translateAmount.y,
      nodeTypes.pool
    );

    waitToRenderAllShapes();

    // Validate that the selected pools were moved
    const newPool1Position = {
      x: pool1Position.x + translateAmount.x,
      y: pool1Position.y + translateAmount.y,
    };
    const newPool2Position = {
      x: pool2Position.x + translateAmount.x,
      y: pool2Position.y + translateAmount.y,
    };

    getElementAtPosition(newPool1Position, nodeTypes.pool).then(($pool1) => {
      const { x, y } = $pool1.position();
      expect({ x, y }).to.eql(newPool1Position);
    });

    getElementAtPosition(newPool2Position, nodeTypes.pool).then(($pool2) => {
      const { x, y } = $pool2.position();
      expect({ x, y }).to.eql(newPool2Position);
    });
  });
});
