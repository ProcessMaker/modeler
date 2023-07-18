import {
  clickAndDropElement,
  getElementAtPosition,
  modalConfirm,
  toggleInspector,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Manual Task', () => {
  it('Update Manual Task name', () => {
    const testString = 'testing';

    const manualTaskPosition = { x: 300, y: 200 };
    clickAndDropElement(nodeTypes.task, manualTaskPosition);
    waitToRenderAllShapes();

    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    modalConfirm();

    getElementAtPosition(manualTaskPosition).click();

    toggleInspector();
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Correctly renders Manual Task after undo/redo', () => {
    const manualTaskPosition = { x: 300, y: 200 };
    clickAndDropElement(nodeTypes.task, manualTaskPosition);
    waitToRenderAllShapes();

    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    modalConfirm();

    cy.get('[data-cy="undo-control"]').click();
    waitToRenderAllShapes();
    cy.get('[data-cy="redo-control"]').click();
    waitToRenderAllShapes();

    getElementAtPosition(manualTaskPosition).getType().should('equal', nodeTypes.manualTask);
  });

});
