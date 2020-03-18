import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
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

  it('Can create sub process with config', () => {
    const subProcessPosition = { x: 250, y: 250 };
    const processName = 'Process with multiple start events';
    const startEventName = 'Start Event Two';
    const encodedConfig = JSON.stringify({
      calledElement: 'Subprocess1-5',
      processId: 5,
      startEvent: 'node_10',
      name: `${processName} (${startEventName})`,
    }).replace(/"/g, '&#34;');

    addNodeTypeToPaper(subProcessPosition, nodeTypes.task, 'switch-to-sub-process');
    getElementAtPosition(subProcessPosition)
      .click({ force: true });

    cy.get('[data-test="inspector-container"]')
      .contains('Process')
      .next('.multiselect')
      .click()
      .find('.multiselect__content')
      .contains(processName)
      .click();

    cy.get('[data-test="inspector-container"]')
      .contains('Start Event')
      .next('.multiselect')
      .click()
      .find('.multiselect__content')
      .contains(startEventName)
      .click();

    assertDownloadedXmlContainsExpected(`<bpmn:callActivity id="node_3" name="${processName} (${startEventName})" calledElement="Subprocess1-5" pm:config="${encodedConfig}" />`);
  });

  it('Can switch task type when initially added', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
    cy.get('[data-test=switch-to-manual-task]').click();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.manualTask);
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

  it('Allows typing in name field on new sub process', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });
});
