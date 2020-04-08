import {
  dragFromSourceToDest,
  getElementAtPosition,
  setBoundaryEvent,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';
import { CommonBoundaryEventBehaviour } from '../support/BoundaryEventCommonBehaviour';

describe('Boundary Conditional Event', () => {
  const taskPosition = { x: 200, y: 200 };
  const boundaryConditionalEventPosition = { x: 260, y: 200 };

  beforeEach(() => {
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    setBoundaryEvent(nodeTypes.boundaryConditionalEvent, taskPosition);
  });

  it('can toggle interrupting on Boundary Conditional Events', () => {
    const interrupting = '[name=cancelActivity]';
    cy.get(interrupting).should('be.checked');

    cy.get('[data-test=undo]').click({ force: true });
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click({ force: true });
    waitToRenderAllShapes();

    getElementAtPosition(boundaryConditionalEventPosition, nodeTypes.boundaryConditionalEvent).click();

    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({ force: true });
    cy.get(interrupting).should('not.be.checked');
  });
});

CommonBoundaryEventBehaviour({
  type: 'Boundary Conditional Event',
  nodeType: nodeTypes.boundaryConditionalEvent,
  eventXMLSnippet: '<bpmn:boundaryEvent id="node_3" name="Boundary Conditional Event" attachedToRef="node_2"><bpmn:conditionalEventDefinition /></bpmn:boundaryEvent>',
  taskType: nodeTypes.task,
  taskTypeSelector: 'switch-to-user-task',
  invalidTargets: [{ type: nodeTypes.startEvent }],
});
