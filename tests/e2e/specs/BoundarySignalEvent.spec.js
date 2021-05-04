import {
  assertDownloadedXmlContainsExpected,
  dragFromSourceToDest,
  getElementAtPosition,
  setBoundaryEvent,
  typeIntoTextInput,
  selectOptionByName,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';
import { CommonBoundaryEventBehaviour } from '../support/BoundaryEventCommonBehaviour';
import _ from 'lodash';

describe('Boundary Signal Event', () => {
  const taskPosition = { x: 200, y: 200 };
  const boundarySignalEventPosition = { x: 260, y: 200 };

  beforeEach(() => {
    cy.window().then((win) => {
      _.set(win, 'ProcessMaker.modeler.signalPermissions', {
        'create-signals':true,'view-signals':true,'edit-signals':true,'delete-signals':true,
      });
    });
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    setBoundaryEvent(nodeTypes.boundarySignalEvent, taskPosition);
  });

  it('update boundary signal event properties element', () => {
    const name = 'Test name';
    const signalRef = 'global_1';
    const signalName = 'global signal 1';
    typeIntoTextInput('[name=name]', name);
    selectOptionByName('[data-test="signalRef:select"]', signalName);

    assertDownloadedXmlContainsExpected(`
      <bpmn:boundaryEvent id="node_3" name="${ name }" attachedToRef="node_2">
        <bpmn:signalEventDefinition signalRef="${ signalRef }" />
      </bpmn:boundaryEvent>
    `);
  });

  it('can toggle interrupting on Boundary Signal Events', () => {
    const interrupting = '[name=cancelActivity]';
    cy.get(interrupting).should('be.checked');

    cy.get('[data-test=undo]').click({ force: true });
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click({ force: true });
    waitToRenderAllShapes();

    getElementAtPosition(boundarySignalEventPosition, nodeTypes.boundarySignalEvent).click();

    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({ force: true });
    cy.get(interrupting).should('not.be.checked');
  });
});

CommonBoundaryEventBehaviour({
  type: 'Boundary Signal Event',
  nodeType: nodeTypes.boundarySignalEvent,
  eventXMLSnippet: '<bpmn:boundaryEvent id="node_3" name="Boundary Signal Event" attachedToRef="node_2"><bpmn:signalEventDefinition /></bpmn:boundaryEvent>',
  taskType: nodeTypes.task,
  taskTypeSelector: 'switch-to-user-task',
  invalidTargets: [{ type: nodeTypes.startEvent }],
});
