import {
  clickAndDropElement,
  getElementAtPosition,
  waitToRenderAllShapes,
} from '../../../support/utils';
import { nodeTypes } from '../../../support/constants';

describe('Selection of pool with shift click', () => {
  it('should add to selection a pool with shift key', () => {
    cy.get('[data-cy="zoom-out-control"]').click();
    cy.get('[data-cy="zoom-out-control"]').click();
    cy.get('[data-cy="zoom-out-control"]').click();
    // Drag pool 1 and elements inside
    const pool1Position = { x: 200, y: 50 };
    clickAndDropElement(nodeTypes.pool, pool1Position);

    const taskPosition1 = { x: 220, y: 180 };
    const endEventPosition1 = { x: 350, y: 200 };
    clickAndDropElement(nodeTypes.task, taskPosition1);
    clickAndDropElement(nodeTypes.endEvent, endEventPosition1);

    // Drag pool 2 and elements inside
    const pool2Position = { x: 300, y: 400 };
    clickAndDropElement(nodeTypes.pool, pool2Position);

    const startEventPosition2 = { x: 390, y: 500 };
    const taskPosition2 = { x: 480, y: 500 };
    const endEventPosition2 = { x: 640, y: 500 };
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
    cy.get('[data-type="processmaker.modeler.bpmn.pool"]').eq(0).then(($pool1) => {
      pool1 = $pool1[0].getBoundingClientRect();
    });

    // get current position of pool 2
    // eslint-disable-next-line no-unused-vars
    let pool2;
    cy.get('[data-type="processmaker.modeler.bpmn.pool"]').eq(1).then(($pool2) => {
      pool2 = $pool2[0].getBoundingClientRect();
    });

    // Move the selected pools to another position (upper)
    cy.get('.paper-container').trigger('mousedown', { clientX: 300, clientY: 400 });
    cy.get('.paper-container').trigger('mousemove', { clientX: 387, clientY: 450 });
    cy.get('.paper-container').trigger('mousemove', { clientX: 400, clientY: 600 });
    cy.get('.paper-container').trigger('mouseup',{ clientX: 400, clientY: 600 });

    waitToRenderAllShapes();
    cy.log('this is the position of'+ pool1);

    cy.get('[data-type="processmaker.modeler.bpmn.pool"]').eq(0).then(($pool1) => {
      const { y } = $pool1[0].getBoundingClientRect();
      expect(pool1.y).to.be.lessThan(y);
    });

    cy.get('[data-type="processmaker.modeler.bpmn.pool"]').eq(1).then(($pool2) => {
      const { y } = $pool2[0].getBoundingClientRect();
      expect(pool2.y).to.be.lessThan(y);
    });
  });
});
