import {
  dragFromSourceToDest,
  getElementAtPosition,
  removeIndentationAndLinebreaks,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Boundary Escalation Event', () => {
  it('Render a boundary escalation event', function() {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryEscalationEventPosition = { x: 260, y: 260 };
    dragFromSourceToDest(nodeTypes.boundaryEscalationEvent, boundaryEscalationEventPosition);

    getElementAtPosition(boundaryEscalationEventPosition).click();

    const boundaryEscalationEventXML = '<bpmn:boundaryEvent id="node_3" name="New Boundary Escalation Event" attachedToRef="node_2"><bpmn:escalationEventDefinition /></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(boundaryEscalationEventXML);
      });
  });
});