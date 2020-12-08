import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  getElementAtPosition,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

function selectCalledProcess(calledProcessName) {
  cy.get('[data-test="inspector-container"]')
    .contains('Process')
    .next('.multiselect')
    .click()
    .find('.multiselect__content')
    .contains(calledProcessName)
    .click();
}

function selectSubProcessStartEvent(startEventName) {
  cy.get('[data-test="inspector-container"]')
    .contains('Start Event')
    .next('.multiselect')
    .click()
    .find('.multiselect__content')
    .contains(startEventName)
    .click();
}

function addSubprocessToPaper(position) {
  addNodeTypeToPaper(position, nodeTypes.task, 'switch-to-sub-process');
}

function clickSubprocessPlusButton() {
  cy.get('.main-paper [data-type="processmaker.components.nodes.task.Shape"] [joint-selector="bottomCenter.0"]').click();
}

describe('Sub Process (Call Activities)', () => {
  const subProcessPosition = { x: 250, y: 250 };
  const testString = 'testing';
  const defaultSubProcessNodeName = 'Sub Process';

  it('Can create sub process with config', () => {
    const calledProcessName = 'Process with multiple start events';
    const startEventName = 'Start Event Two';
    const encodedConfig = JSON.stringify({
      calledElement: 'Subprocess1-5',
      processId: 5,
      startEvent: 'node_10',
      name: `${defaultSubProcessNodeName}`,
    }).replace(/"/g, '&#34;');

    addSubprocessToPaper(subProcessPosition);
    getElementAtPosition(subProcessPosition).click({ force: true });

    selectCalledProcess(calledProcessName);
    selectSubProcessStartEvent(startEventName);

    assertDownloadedXmlContainsExpected(`<bpmn:callActivity id="node_3" name="${defaultSubProcessNodeName}" calledElement="Subprocess1-5" pm:config="${encodedConfig}" />`);
  });

  it('Allows typing in name field on new sub process', () => {
    addSubprocessToPaper(subProcessPosition);
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('shows a message when clicking the [+] if no subprocess selected', () => {
    addSubprocessToPaper(subProcessPosition);

    clickSubprocessPlusButton();

    cy.get('.modal-content')
      .should('contain.text', 'No subprocess selected')
      .should('contain.text', 'Please select a subprocess to view it.');
  });

  it('shows a subprocess SVG modal when clicking the [+] button', () => {
    const calledProcessName = 'Process with multiple start events';
    const calledSubProcessId = 5;

    addSubprocessToPaper(subProcessPosition);
    getElementAtPosition(subProcessPosition).click({ force: true });

    selectCalledProcess(calledProcessName);

    cy.clock();
    clickSubprocessPlusButton();

    cy.tick(500);
    cy.get('.modal-content')
      .should('contain.text', `You are viewing subprocess for '${defaultSubProcessNodeName}'`)
      .should('contain.text', 'Loading process preview...');

    cy.tick(1000);
    cy.get('.modal-content')
      .should('not.contain.text', 'Loading process preview...')
      .should('contain.html', '<svg');

    cy.get('[data-test="modal-process-link"]').should('have.attr', 'href', `/modeler/${calledSubProcessId}`);
  });

  it('shows error message when loading of SVG fails', () => {
    const calledProcessName = 'Process with mocked axios failure';

    addSubprocessToPaper(subProcessPosition);
    getElementAtPosition(subProcessPosition).click({ force: true });

    selectCalledProcess(calledProcessName);

    cy.clock();
    clickSubprocessPlusButton();
    cy.tick(2000);
    cy.get('.modal-content').should('contain.text', 'Could not load preview');
  });
});
