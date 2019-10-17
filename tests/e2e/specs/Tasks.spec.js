import {
  connectNodesWithFlow,
  dragFromSourceToDest,
  getElementAtPosition,
  getLinksConnectedToElement,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Tasks', () => {
  it('Update task name', () => {
    const testString = 'testing';

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    getElementAtPosition(taskPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Correctly renders task after undo/redo', () => {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.task);
  });

  it('Can create call activity flow', function() {
    const startEventPosition = { x: 150, y: 150 };
    const callActivityPosition = { x: 250, y: 250 };

    dragFromSourceToDest(nodeTypes.callActivity, callActivityPosition);

    getElementAtPosition(callActivityPosition).should('exist');

    connectNodesWithFlow('sequence-flow-button', startEventPosition, callActivityPosition);
    getElementAtPosition(callActivityPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    waitToRenderAllShapes();

    cy.get('.inspector-container')
      .should('contain', 'A process has not been configured in the connected Call Activity task.');
    cy.get('[name=startEvent]').should('not.exist');

    getElementAtPosition(callActivityPosition).click({ force: true });

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

    getElementAtPosition(callActivityPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    waitToRenderAllShapes();

    cy.get('.inspector-container')
      .should('not.contain', 'A process has not been configured in the connected Call Activity task.');
    cy.get('[name=startEvent]').select('awesome start event');

    const sequenceFlowXml = '<bpmn:sequenceFlow id="node_3" name="New Sequence Flow" sourceRef="node_1" targetRef="node_2" pm:startEvent="node_2" />';
    const callActivityXml = `<bpmn:callActivity id="node_2" name="Process with start event" calledElement="ProcessId-3">
      <bpmn:incoming>node_3</bpmn:incoming>
    </bpmn:callActivity>`;

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .then(xml => {
        expect(xml).to.contain(sequenceFlowXml.trim());
        expect(xml).to.contain(callActivityXml.trim());
      });

    getElementAtPosition(callActivityPosition).click({ force: true });
    cy.get('.multiselect')
      .click()
      .get('.multiselect__content')
      .contains('Process with start event')
      .click();

    getElementAtPosition(callActivityPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    waitToRenderAllShapes();
    cy.get('.inspector-container')
      .should('contain', 'A process has not been configured in the connected Call Activity task.');

    const emptyCallActivityXml = 'calledElement=""';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .then(xml => {
        expect(xml).to.contain(emptyCallActivityXml.trim());
      });
  });

  it('Shows secondary dropdown for task user assignment', function() {
    if (!Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    getElementAtPosition(taskPosition).click();

    cy.contains('Task Assignment').next().select('User');
    cy.contains('Assigned User')
      .should('exist')
      .next().find('.multiselect').should('exist');

    cy.contains('Task Assignment').next().select('Group');
    cy.contains('Assigned Group')
      .should('exist')
      .next().find('.multiselect').should('exist');
  });
});
