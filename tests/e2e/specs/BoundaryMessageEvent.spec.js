import {
  dragFromSourceToDest,
  getElementAtPosition,
  removeIndentationAndLinebreaks,
  setBoundaryEvent,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Boundary Message Event', () => {
  const taskType = nodeTypes.subProcess;

  it('Render an interrupting boundary message event', function() {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(taskType, taskPosition);

    setBoundaryEvent(nodeTypes.boundaryMessageEvent, taskPosition, taskType);

    const boundaryMessageEventXML = '<bpmn:boundaryEvent id="node_3" name="New Boundary Message Event" attachedToRef="node_2"><bpmn:messageEventDefinition /></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(boundaryMessageEventXML);
      });
  });

  it('Render a non-interrupting boundary message event', function() {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(taskType, taskPosition);

    setBoundaryEvent(nodeTypes.boundaryMessageEvent, taskPosition, taskType);
    getElementAtPosition(taskPosition).click();

    const interrupting = '[name=cancelActivity]';
    cy.get(interrupting).click();
    const boundaryMessageEventXML = '<bpmn:boundaryEvent id="node_3" name="New Boundary Message Event" cancelActivity="false" attachedToRef="node_2"><bpmn:messageEventDefinition /></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(boundaryMessageEventXML);
      });
  });
});
