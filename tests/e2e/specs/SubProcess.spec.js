import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  getElementAtPosition,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Sub Process (Call Activities)', () => {
  const taskPosition = { x: 250, y: 250 };
  const testString = 'testing';

  it('Can create sub process with config', () => {
    const processName = 'Process with multiple start events';
    const subProcessPosition = { x: 250, y: 250 };
    const subProcessName = 'Sub Process';
    const startEventName = 'Start Event Two';
    const encodedConfig = JSON.stringify({
      calledElement: 'Subprocess1-5',
      processId: 5,
      startEvent: 'node_10',
      name: `${subProcessName}`,
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

    assertDownloadedXmlContainsExpected(`<bpmn:callActivity id="node_3" name="${subProcessName}" calledElement="Subprocess1-5" pm:config="${encodedConfig}" />`);
  });

  it('Allows typing in name field on new sub process', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('shows a message when clicking the [+] if no subprocess selected', () => {
    const subProcessPosition = { x: 250, y: 250 };

    addNodeTypeToPaper(subProcessPosition, nodeTypes.task, 'switch-to-sub-process');

    cy.get('.main-paper [data-type="processmaker.components.nodes.task.Shape"] [joint-selector="bottomCenter.0"]').click();
    cy.get('.modal-content')
      .should('contain.text', 'No subprocess selected')
      .should('contain.text', 'Please select a subprocess to view it.');
  });

  it('shows a subprocess SVG modal when clicking the [+] button', () => {
    const processName = 'Process with multiple start events';
    const subProcessPosition = { x: 250, y: 250 };
    const subProcessName = 'Sub Process';
    const subProcessId = 5;

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

    cy.clock();
    cy.get('.main-paper [data-type="processmaker.components.nodes.task.Shape"] [joint-selector="bottomCenter.0"]').click();

    cy.tick(500);
    cy.get('.modal-content')
      .should('contain.text', `You are viewing subprocess for '${subProcessName}'`)
      .should('contain.text', 'Loading process preview...');

    cy.tick(1000);
    cy.get('.modal-content')
      .should('not.contain.text', 'Loading process preview...')
      .should('contain.html', '<svg');

    cy.get('[data-test="modal-process-link"]').should('have.attr', 'href', `/modeler/${subProcessId}`);
  });

  it.only('shows error message when loading of SVG fails', () => {
    const processName = 'Process with mocked axios failure';
    const subProcessPosition = { x: 250, y: 250 };

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

    cy.clock();
    cy.get('.main-paper [data-type="processmaker.components.nodes.task.Shape"] [joint-selector="bottomCenter.0"]').click();
    cy.tick(2000);
    cy.get('.modal-content').should('contain.text', 'Could not load preview');
  });
});
