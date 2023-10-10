import { clickAndDropElement, getElementAtPosition, waitToRenderAllShapes } from '../support/utils';
import { nodeTypes } from '../support/constants';

const CYPRESS_UNDO_SCROLL_ADJUSTMENT = 60.5;

describe('Keyboard movement interaction', { scrollBehavior: false }, () => {
  it('Can move a node using the keyboard arrows', () => {
    const taskPosition = { x: 400, y: 300 };
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).then($task => {
      const { top, left } = $task.position();
      cy.get('body').type('{uparrow}{uparrow}{uparrow}{uparrow}');
      cy.get('body').type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}');
      waitToRenderAllShapes();

      getElementAtPosition(taskPosition).then($task => {
        const { top: newTop, left: newLeft } = $task.position();

        expect(newTop).to.be.lessThan(top);
        expect(newLeft).to.be.lessThan(left);
      });
    });
  });

  it('can undo keyboard moves', () => {
    const taskPosition = { x: 400, y: 500 };
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).then($task => {
      const { top, left } = $task.position();

      cy.get('body').type('{uparrow}');
      cy.get('body').type('{leftarrow}');
      waitToRenderAllShapes();

      cy.get('[data-cy="undo-control"]').click({ force: true });
      cy.get('[data-cy="undo-control"]').click({ force: true });

      waitToRenderAllShapes();

      getElementAtPosition(taskPosition).then($task => {
        const { top: newTop, left: newLeft } = $task.position();

        expect(newTop - CYPRESS_UNDO_SCROLL_ADJUSTMENT).to.be.approximately(top, 65);
        expect(newLeft).to.be.approximately(left, 2);
      });
    });
  });
});
