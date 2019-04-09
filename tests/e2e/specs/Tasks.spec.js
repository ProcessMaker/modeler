import {
  dragFromSourceToDest,
  typeIntoTextInput,
  waitToRenderAllShapes,
  getElementAtPosition,
  connectNodesWithFlow,
  getLinksConnectedToElement,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Tasks', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update task name', () => {
    const testString = 'testing';

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Correctly renders task after undo/redo', () => {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    waitToRenderAllShapes();
    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.task);
  });

  it('Can create call activity flow', () => {
    const startEventPosition = { x: 150, y: 150 };
    const callActivityPosition = { x: 250, y: 250 };

    dragFromSourceToDest(nodeTypes.callActivity, callActivityPosition);

    waitToRenderAllShapes();
    getElementAtPosition(callActivityPosition).should('exist');

    connectNodesWithFlow('sequence-flow-button', startEventPosition, callActivityPosition);
    getElementAtPosition(callActivityPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    waitToRenderAllShapes();

    cy.get('#startEvent').should('contain', 'A process has not been configred in the connnected Call Acitivty task.');
    cy.get('[name=startEvent]').should('not.exist');

    getElementAtPosition(callActivityPosition).click();

    cy.get('select[name=calledElement]').select('Process with start event');

    getElementAtPosition(callActivityPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    cy.get('#startEvent').should('not.contain', 'A process has not been configred in the connnected Call Acitivty task.');
    cy.get('[name=startEvent]').select('awesome start event');

    const sequneceFlowML = '<bpmn:sequenceFlow id="node_3" sourceRef="node_1" targetRef="node_2" pm:startEvent="node_1" />';
    const callActivityXML = `<bpmn:callActivity id="node_2" name="New Call Activity" calledElement="3">
      <bpmn:incoming>node_3</bpmn:incoming>
    </bpmn:callActivity>`;

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .then(xml => {
        expect(xml).to.contain(sequneceFlowML.trim());
        expect(xml).to.contain(callActivityXML.trim());
      });
  });
});
