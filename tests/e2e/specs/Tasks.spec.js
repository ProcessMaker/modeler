import {
  addNodeTypeToPaper,
  dragFromSourceToDest,
  getElementAtPosition,
  modalCancel,
  modalConfirm,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Tasks', () => {
  const taskPosition = { x: 250, y: 250 };
  const testString = 'testing';

  it('Update task name', () => {
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    getElementAtPosition(taskPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Correctly renders task after undo/redo', () => {
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.task);
  });

  it('Can switch task type when initially added', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
    cy.get('[data-test="select-type-dropdown"]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    modalConfirm();
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.manualTask);
  });

  it('Can keep the name when switching task type', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');
    typeIntoTextInput('[name=name]', testString);

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
    cy.get('[data-test="select-type-dropdown"]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    modalConfirm();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.manualTask);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Can switch task type after initially added', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');

    getElementAtPosition({ x: 150, y: 150 }).click();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    modalConfirm();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.manualTask);
  });

  it('Does not switch task type if canceled', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');

    getElementAtPosition({ x: 150, y: 150 }).click();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    modalCancel();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
  });
});
