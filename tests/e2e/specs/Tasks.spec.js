import {
  addNodeTypeToPaper,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getElementAtPosition,
  getLinksConnectedToElement,
  modalCancel,
  modalConfirm,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Tasks', () => {
  const taskPosition = { x: 250, y: 250 };

  it('Update task name', () => {
    const testString = 'testing';

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

  it('Can create sub process flow', () => {
    const subProcessPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(subProcessPosition, nodeTypes.task, 'switch-to-sub-process');

    getElementAtPosition(subProcessPosition).should('exist');

    connectNodesWithFlow('sequence-flow-button', { x: 150, y: 150 }, subProcessPosition);
    getElementAtPosition(subProcessPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    waitToRenderAllShapes();

    cy.get('.inspector-container')
      .should('contain', 'A process has not been configured in the connected Sub Process task.');
    cy.get('[name=startEvent]').should('not.exist');

    getElementAtPosition(subProcessPosition).click({ force: true });

    cy.get('.inspector-container').contains('Open Process').should('not.exist');
    cy.get('.multiselect')
      .click()
      .find('.multiselect__content')
      .contains('Process with start event')
      .click();
    cy.get('.inspector-container')
      .contains('Open Process')
      .should('exist');

    waitToRenderAllShapes();

    getElementAtPosition(subProcessPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    waitToRenderAllShapes();

    cy.get('.inspector-container')
      .should('not.contain', 'A process has not been configured in the connected Sub Process task.');
    cy.get('[name=startEvent]').select('awesome start event');

    const sequenceFlowXml = '<bpmn:sequenceFlow id="node_4" name="New Sequence Flow" sourceRef="node_1" targetRef="node_3" pm:startEvent="node_2" />';
    const subProcessXml = `<bpmn:callActivity id="node_3" name="Process with start event" calledElement="ProcessId-3">
      <bpmn:incoming>node_4</bpmn:incoming>
    </bpmn:callActivity>`;

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .then(xml => {
        expect(xml).to.contain(sequenceFlowXml.trim());
        expect(xml).to.contain(subProcessXml.trim());
      });

    getElementAtPosition(subProcessPosition).click({ force: true });
    cy.get('.multiselect')
      .click()
      .get('.multiselect__content')
      .contains('Process with start event')
      .click();

    getElementAtPosition(subProcessPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    waitToRenderAllShapes();
    cy.get('.inspector-container')
      .should('contain', 'A process has not been configured in the connected Sub Process task.');

    const emptyCallActivityXml = 'calledElement=""';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .then(xml => {
        expect(xml).to.contain(emptyCallActivityXml.trim());
      });
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
});
