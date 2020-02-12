import { dragFromSourceToDest, getElementAtPosition, getGraphElements, waitToRenderAllShapes } from '../support/utils';
import { nodeTypes } from '../support/constants';
import { CommonBoundaryEventBehaviour } from '../support/BoundaryEventCommonBehaviour';
import { defaultNodeColor } from '../../../src/components/nodeColors';

describe.skip('Boundary Escalation Event', () => {

  it('can toggle interrupting on Boundary Escalation Events', () => {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.subProcess, taskPosition);

    const boundaryEscalationEventPosition = { x: 260, y: 260 };
    dragFromSourceToDest(nodeTypes.boundaryEscalationEvent, boundaryEscalationEventPosition);

    getElementAtPosition(boundaryEscalationEventPosition).click();

    const interrupting = '[name=cancelActivity]';
    cy.get(interrupting).should('be.checked');

    cy.get('[data-test=undo]').click({ force: true });
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click({ force: true });
    waitToRenderAllShapes();

    getElementAtPosition(boundaryEscalationEventPosition).click();

    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({ force: true });
    cy.get(interrupting).should('not.be.checked');
  });

  it('can only embed onto a sub process', () => {
    const initialNumberOfElements = 1;
    const inValidBoundaryEscalationEventTargets = [
      { type: nodeTypes.task, position: { x: 100, y: 300 } },
      { type: nodeTypes.subProcess, position: { x: 240, y: 300 } },
      { type: nodeTypes.scriptTask, position: { x: 380, y: 300 } },
      { type: nodeTypes.manualTask, position: { x: 100, y: 400 } },
      { type: nodeTypes.sendTweet, position: { x: 240, y: 400 } },
      { type: nodeTypes.taskWithMarker, position: { x: 380, y: 400 } },
    ];

    inValidBoundaryEscalationEventTargets.forEach(({ type, position }) => {
      dragFromSourceToDest(type, position);
    });

    const numberOfElementsExpected = initialNumberOfElements + inValidBoundaryEscalationEventTargets.length;
    getGraphElements().should('have.length', numberOfElementsExpected);

    inValidBoundaryEscalationEventTargets.forEach(({ position }) => {
      dragFromSourceToDest(nodeTypes.boundaryEscalationEvent, position);
    });

    const callActivityEscalation = 1;
    getGraphElements().should('have.length', numberOfElementsExpected + callActivityEscalation);

  });
});

CommonBoundaryEventBehaviour({
  type: 'Boundary Escalation Event',
  nodeType: nodeTypes.boundaryEscalationEvent,
  eventXMLSnippet: '<bpmn:boundaryEvent id="node_4" name="Boundary Escalation Event" attachedToRef="node_3"><bpmn:escalationEventDefinition /></bpmn:boundaryEvent>',
  taskType: nodeTypes.subProcess,
  taskTypeSelector: 'switch-to-sub-process',
  invalidTargets: [{ type: nodeTypes.startEvent }, { type: nodeTypes.task, color: defaultNodeColor }],
  skip: true,
});
