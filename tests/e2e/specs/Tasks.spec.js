import {
  dragFromSourceToDest,
  typeIntoTextInput,
  waitToRenderAllShapes,
  getElementAtPosition,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Tasks', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update task name', () => {
    const testString = 'testing';

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Correctly renders task after undo/redo', () => {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    waitToRenderAllShapes();
    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.task);
  });

  it('Can create call activity', () => {
    const callActivityPosition = { x: 250, y: 250 };

    dragFromSourceToDest(nodeTypes.callActivity, callActivityPosition);

    waitToRenderAllShapes();

    getElementAtPosition(callActivityPosition).should('exist');
  });
});
