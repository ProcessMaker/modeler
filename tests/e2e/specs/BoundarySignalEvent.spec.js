import {
  dragFromSourceToDest,
  getElementAtPosition,
  moveElement,
  removeIndentationAndLinebreaks,
  setBoundaryEvent,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';
import { CommonBoundaryEventBehaviour } from './BoundaryEventCommonBehaviour.spec';

describe('Boundary Signal Event', () => {
  const taskPosition = { x: 200, y: 200 };
  const boundarySignalEventPosition = { x: 260, y: 200 };

  it('update boundary signal event properties element', () => {
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    setBoundaryEvent(nodeTypes.boundarySignalEvent, taskPosition);
    moveElement(taskPosition, boundarySignalEventPosition.x, boundarySignalEventPosition.y);

    const name = 'Test name';
    typeIntoTextInput('[name=name]', name);

    const signalXML = '<bpmn:boundaryEvent id="node_3" name="Test name" attachedToRef="node_2"><bpmn:signalEventDefinition /></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(signalXML);
      });
  });

  it('can toggle interrupting on Boundary Signal Events', () => {
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    setBoundaryEvent(nodeTypes.boundarySignalEvent, taskPosition);
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
  eventXMLSnippet: '<bpmn:boundaryEvent id="node_3" name="New Boundary Signal Event" attachedToRef="node_2"><bpmn:signalEventDefinition /></bpmn:boundaryEvent>',
  taskType: nodeTypes.task,
  taskTypeSelector: 'switch-to-user-task',
  invalidTargets: [{ type: nodeTypes.startEvent }],
});
