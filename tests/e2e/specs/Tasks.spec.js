import {
  addNodeTypeToPaper,
  clickAndDropElement,
  getElementAtPosition, modalAnimationTime,
  modalCancel,
  modalConfirm,
  toggleInspector,
  typeIntoTextInput, waitForAnimations,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Tasks', () => {
  const taskPosition = { x: 350, y: 250 };
  const testString = 'testing';

  beforeEach(() => {
    toggleInspector();
  });

  it('Update task name', () => {
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Correctly renders task after undo/redo', () => {
    clickAndDropElement(nodeTypes.task, taskPosition);

    cy.get('[data-cy="undo-control"]').click();
    waitToRenderAllShapes();
    cy.get('[data-cy="redo-control"]').click();
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.task);
  });

  it('Should not display modal when switching task type when *initially* added', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');
    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
  });

  it('Can keep the name when switching task type', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');
    typeIntoTextInput('[name=name]', testString);

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
    cy.get('[data-test="select-type-dropdown"]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    cy.wait(modalAnimationTime);
    modalConfirm();
    waitForAnimations();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.manualTask);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Should display modal to switch task type *after* initially added', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');

    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    cy.wait(modalAnimationTime);

    cy.get('#modal-prevent-closing').should('be.visible').and('contain.text', 'Changing this type will replace your current configuration');

    modalConfirm();
    waitForAnimations();
    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.manualTask);
  });

  it('Does not switch task type if canceled', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');

    getElementAtPosition({ x: 210, y: 200 }).click();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    modalCancel();
    waitForAnimations();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
  });
});
