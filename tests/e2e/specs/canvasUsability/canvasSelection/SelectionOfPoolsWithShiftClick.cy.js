import {
  clickAndDropElement,
  getElementAtPosition,
  waitToRenderAllShapes,
} from '../../../support/utils';
import { nodeTypes } from '../../../support/constants';

describe.skip('Selection of pool with shift click', () => {
  it('should add to selection a pool with shift key', () => {
    // Drag pool 1 and elements inside
    const pool1Position = { x: 200, y: 50 };
    clickAndDropElement(nodeTypes.pool, pool1Position);

    const taskPosition1 = { x: 480, y: 180 };
    const endEventPosition1 = { x: 640, y: 240 };
    clickAndDropElement(nodeTypes.task, taskPosition1);
    clickAndDropElement(nodeTypes.endEvent, endEventPosition1);

    // Drag pool 2 and elements inside
    const pool2Position = { x: 300, y: 550 };
    clickAndDropElement(nodeTypes.pool, pool2Position);

    const startEventPosition2 = { x: 280, y: 620 };
    const taskPosition2 = { x: 480, y: 500 };
    const endEventPosition2 = { x: 640, y: 620 };
    clickAndDropElement(nodeTypes.startEvent, startEventPosition2);
    clickAndDropElement(nodeTypes.task, taskPosition2);
    clickAndDropElement(nodeTypes.endEvent, endEventPosition2);

    // Select both pools with click
    cy.get('.paper-container')
      .trigger('mousedown', { x: 100, y: 20, which: 1 })
      .trigger('mousemove', { x: 680, y: 700 })
      .trigger('mousemove', { x: 680, y: 700 })
      .trigger('mouseup', { force: true });

    // Validate that two pools were selected ([data-length=2])
    cy.get('[data-cy="selection-box"]').should('have.attr', 'data-length', '2');

    // get current position of pool 1
    // eslint-disable-next-line no-unused-vars
    let pool1;
    getElementAtPosition(pool1Position, nodeTypes.pool,true, 12, 100).then(($pool1) => {
      pool1 = $pool1[0].getBoundingClientRect();
    });

    // get current position of pool 2
    // eslint-disable-next-line no-unused-vars
    let pool2;
    getElementAtPosition(pool2Position, nodeTypes.pool,true).then(($pool2) => {
      pool2 = $pool2[0].getBoundingClientRect();
    });

    // Move the selected pools to another position (upper)
    const translateAmount = { x: 0, y: 100 };
    // click and drag fromPosition to fromPosition + translateAmount
    cy.get('.paper-container').trigger('mousedown', { which: 1, x: pool1Position.x, y: pool1Position.y  });
    cy.get('.paper-container').trigger('mousemove', { x: pool1Position.x + translateAmount.x, y: pool1Position.y + translateAmount.y  });
    cy.get('.paper-container').trigger('mousemove', { x: pool1Position.x + translateAmount.x, y: pool1Position.y + translateAmount.y  });
    waitToRenderAllShapes();
    cy.get('.paper-container').trigger('mouseup',{ force: true });

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

    getElementAtPosition(newPool1Position, nodeTypes.pool,true).then(($pool1) => {
      const { y } = $pool1[0].getBoundingClientRect();
      expect(pool1.y).to.be.lessThan(y);
    });

    getElementAtPosition(newPool2Position, nodeTypes.pool,true).then(($pool2) => {
      const { y } = $pool2[0].getBoundingClientRect();
      expect(pool2.y).to.be.lessThan(y);
    });
  });
});
