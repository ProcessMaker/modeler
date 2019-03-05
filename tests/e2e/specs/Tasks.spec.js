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
    dragFromSourceToDest(nodeTypes.task,taskPosition);

    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });
});
