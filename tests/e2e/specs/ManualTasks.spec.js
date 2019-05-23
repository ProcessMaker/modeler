import {
  dragFromSourceToDest,
  typeIntoTextInput,
  waitToRenderAllShapes,
  getElementAtPosition,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Manual Task', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update Manual Task name', () => {
    const testString = 'testing';

    const manualTaskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.manualTask, manualTaskPosition);

    getElementAtPosition(manualTaskPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Correctly renders Manual Task after undo/redo', () => {
    const manualTaskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.manualTask, manualTaskPosition);

    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    getElementAtPosition(manualTaskPosition).getType().should('equal', nodeTypes.manualTask);
  });

});
