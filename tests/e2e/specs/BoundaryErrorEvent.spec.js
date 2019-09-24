import {
  dragFromSourceToDest,
  getElementAtPosition,
  removeIndentationAndLinebreaks,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe.only('Boundary Error Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Render a boundary error event', function() {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryErrorEventPosition = { x: 260, y: 260 };
    dragFromSourceToDest(nodeTypes.boundaryErrorEvent, boundaryErrorEventPosition);

    getElementAtPosition(boundaryErrorEventPosition).click();

    const boundaryErrorEventXML = [
      '<bpmn:boundaryEvent id="node_3" name="New Boundary Error Event" attachedToRef="node_2">',
      '<bpmn:errorEventDefinition />',
      '</bpmn:boundaryEvent>',
    ].join('');

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(boundaryErrorEventXML);
      });
  });
});
