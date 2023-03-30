import {
  dragFromSourceToDest,
  getElementAtPosition,
  waitToRenderAllShapes,
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
    getElementAtPosition(pool1Position, nodeTypes.pool, 12, 100).click();

    getElementAtPosition(pool2Position, nodeTypes.pool, 12, 100).click();
    cy.get('body').type('{shift}', { release: true });

    // Validate that two pools were selected ([data-length=2])
    cy.get('[data-cy="selection-box"]').should('have.attr', 'data-length', '2');

    // get current position of pool 1
    // eslint-disable-next-line no-unused-vars
    let pool1;
    getElementAtPosition(pool1Position, nodeTypes.pool, 12, 100).then(($pool1) => {
      pool1 = $pool1[0].getBoundingClientRect();
    });

    // get current position of pool 1
    // eslint-disable-next-line no-unused-vars
    let pool2;
    getElementAtPosition(pool2Position, nodeTypes.pool, 12, 100).then(($pool2) => {
      pool2 = $pool2[0].getBoundingClientRect();
    });

    // Move the selected pools to another position (upper)
    const fromPosition = { x: 200, y: 200 };
    const translateAmount = { x: 0, y: 100 };
    // click and drag fromPosition to fromPosition + translateAmount
    cy.get('.paper-container .joint-paper').trigger('mousedown', { which: 1, pageX: fromPosition.x, pageY: fromPosition.y, force: true});
    cy.get('.paper-container').trigger('mousemove', { which: 1, pageX: fromPosition.x + translateAmount.x, pageY: fromPosition.y + translateAmount.y, force: true});
    waitToRenderAllShapes();
    cy.get('.paper-container .joint-paper').trigger('mouseup',{force: true});

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

    getElementAtPosition(newPool1Position, nodeTypes.pool, 12, 100).then(($pool1) => {
      const { y } = $pool1[0].getBoundingClientRect();
      expect(pool1.y).to.be.lessThan(y);
    });

    getElementAtPosition(newPool2Position, nodeTypes.pool, 12, 100).then(($pool2) => {
      const { y } = $pool2[0].getBoundingClientRect();
      expect(pool1.y).to.be.lessThan(y);
    });
  });
});
