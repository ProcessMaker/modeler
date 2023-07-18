import {
  clickAndDropElement,
  getElementAtPosition,
  getGraphElements,
  moveElementRelativeTo,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Multiselect', { scrollBehavior: false }, () => {
  it('should move multiple shapes when shift+clicking to highlight and then dragging', () => {
    const task1Position = { x: 300, y: 100 };
    const task2Position = { x: task1Position.x + 160, y: task1Position.y + 160 };
    const translateAmount = 200;
    const newTask1Position = { x: task1Position.x + translateAmount, y: task1Position.y + translateAmount };
    const newTask2Position = { x: task2Position.x + translateAmount, y: task2Position.y + translateAmount };

    clickAndDropElement(nodeTypes.task, task1Position);
    clickAndDropElement(nodeTypes.task, task2Position);

    cy.get('.paper-container').click();

    getElementAtPosition(task1Position, nodeTypes.task).click();
    getElementAtPosition(task2Position, nodeTypes.task).click({ shiftKey: true });

    moveElementRelativeTo(task1Position, translateAmount, translateAmount, nodeTypes.task);

    waitToRenderAllShapes();

    getElementAtPosition(newTask1Position, nodeTypes.task).then($task => {
      getGraphElements().then(elements => {
        const { x, y } = elements.find(el => el.get('id') === $task.attr('model-id')).position();
        expect(x).to.be.closeTo(newTask1Position.x, 2);
        expect(y).to.be.closeTo(newTask1Position.y, 2);
      });
    });

    cy.get('.paper-container').click();
    getElementAtPosition(newTask2Position, nodeTypes.task).then($task => {
      getGraphElements().then(elements => {
        const { x, y } = elements.find(el => el.get('id') === $task.attr('model-id')).position();
        expect(x).to.be.closeTo(newTask2Position.x, 2);
        expect(y).to.be.closeTo(newTask2Position.y, 2);
      });
    });
  });

  it('should move multiple shapes when shift+clicking to highlight and then using arrow keys', () => {
    const task1Position = { x: 300, y: 100 };
    const task2Position = { x: task1Position.x + 100, y: task1Position.y + 160 };
    const translateAmount = 20;
    const newTask1Position = { x: task1Position.x + translateAmount, y: task1Position.y + translateAmount };
    const newTask2Position = { x: task2Position.x + translateAmount, y: task2Position.y + translateAmount };
    const moveAmount = 5;
    const numberOfTimesToMove = translateAmount / moveAmount;

    clickAndDropElement(nodeTypes.task, task1Position);
    clickAndDropElement(nodeTypes.task, task2Position);

    cy.get('.paper-container').click();

    getElementAtPosition(task1Position, nodeTypes.task).click();
    getElementAtPosition(task2Position, nodeTypes.task).click({ shiftKey: true });

    for (let i = 0; i < numberOfTimesToMove; i++) {
      cy.get('body').type('{downarrow}');
      cy.get('body').type('{rightarrow}');
    }

    waitToRenderAllShapes();

    getElementAtPosition(newTask1Position, nodeTypes.task).then($task => {
      getGraphElements().then(elements => {
        const { x, y } = elements.find(el => el.get('id') === $task.attr('model-id')).position();
        expect({ x, y }).to.eql(newTask1Position);
      });
    });

    getElementAtPosition(newTask2Position, nodeTypes.task).then($task => {
      getGraphElements().then(elements => {
        const { x, y } = elements.find(el => el.get('id') === $task.attr('model-id')).position();
        expect({ x, y }).to.eql(newTask2Position);
      });
    });
  });

  it('should move multiple shapes when drawing a selection box to highlight and then dragging', () => {
    const task1Position = { x: 300, y: 100 };
    const task2Position = { x: task1Position.x + 160, y: task1Position.y + 160 };
    const translateAmount = 200;
    const newTask1Position = { x: task1Position.x + translateAmount, y: task1Position.y + translateAmount };
    const newTask2Position = { x: task2Position.x + translateAmount, y: task2Position.y + translateAmount };

    clickAndDropElement(nodeTypes.task, task1Position);
    clickAndDropElement(nodeTypes.task, task2Position);

    cy.get('.paper-container').as('paperContainer').click();

    cy.get('body').type('{shift}', { release: false });
    cy.get('@paperContainer').trigger('mousedown', 'topLeft');
    cy.get('@paperContainer').trigger('mousemove', 'bottomRight', { force: true });
    waitToRenderAllShapes();
    cy.get('@paperContainer').trigger('mousemove');
    cy.get('@paperContainer').trigger('mouseup');

    moveElementRelativeTo(task1Position, translateAmount, translateAmount, nodeTypes.task);

    waitToRenderAllShapes();

    getElementAtPosition(newTask1Position, nodeTypes.task).then($task => {
      getGraphElements().then(elements => {
        const { x, y } = elements.find(el => el.get('id') === $task.attr('model-id')).position();
        expect(x).to.be.closeTo(newTask1Position.x, 2);
        expect(y).to.be.closeTo(newTask1Position.y, 2);
      });
    });

    getElementAtPosition(newTask2Position, nodeTypes.task).then($task => {
      getGraphElements().then(elements => {
        const { x, y } = elements.find(el => el.get('id') === $task.attr('model-id')).position();
        expect(x).to.be.closeTo(newTask2Position.x, 2);
        expect(y).to.be.closeTo(newTask2Position.y, 2);
      });
    });
  });

  it('should not move multiple shapes when shift + combo was held down2', () => {
    ['meta', 'ctrl', 'alt'].forEach((combo) => {
      cy.get('.paper-container').as('paperContainer').click();

      cy.get('body').type(`{shift}{${ combo }}`, { release: false });
      cy.get('@paperContainer').trigger('mousedown', 'topLeft');
      cy.get('@paperContainer').trigger('mousemove', 'bottomRight', { force: true });
      waitToRenderAllShapes();
      cy.get('[data-type="selectionBox"]').should('not.exist');
    });
  });
});
