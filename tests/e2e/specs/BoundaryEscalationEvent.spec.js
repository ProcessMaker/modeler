import {
  dragFromSourceToDest,
  getComponentsEmbeddedInShape,
  getElementAtPosition,
  removeIndentationAndLinebreaks,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

const boundaryEventSelector = '.main-paper ' +
    '[data-type="processmaker.components.nodes.task.Shape"] + ' +
    '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';

describe.only('Boundary Escalation Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Render a boundary escalation event', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

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

  it('can successfully undo/redo after dragging onto invalid (empty) space ', function() {
    const taskPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    dragFromSourceToDest(nodeTypes.boundaryEscalationEvent, taskPosition);

    cy.get(boundaryEventSelector).as('boundaryEvent').then($boundaryEvent => {
      const boundaryEventPosition = $boundaryEvent.position();

      cy.wrap($boundaryEvent)
        .trigger('mousedown', { which: 1, force: true })
        .trigger('mousemove', { clientX: 500, clientY: 500, force: true })
        .trigger('mouseup');

      waitToRenderAllShapes();

      cy.get('[data-test=undo]').click({ force: true });
      waitToRenderAllShapes();
      cy.get('[data-test=redo]').click({ force: true });
      waitToRenderAllShapes();

      cy.get('@boundaryEvent').should($boundaryEvent => {
        const { left, top } = $boundaryEvent.position();

        expect(left).to.equal(boundaryEventPosition.left);
        expect(top).to.equal(boundaryEventPosition.top);
      });
    });

    getElementAtPosition(taskPosition);
    getElementAtPosition(taskPosition, nodeTypes.task)
      .then(getComponentsEmbeddedInShape)
      .should($elements => {
        expect($elements).to.have.lengthOf(1);
      });
  });

  it('redo positions it in same location as before undo', function() {
    const taskPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    const boundaryEscalationEventPosition = { x: 300, y: 350 };
    dragFromSourceToDest(nodeTypes.boundaryEscalationEvent, boundaryEscalationEventPosition);

    cy.get(boundaryEventSelector).as('boundaryEvent').then($boundaryEvent => {
      const boundaryEventPosition = $boundaryEvent.position();

      cy.get('[data-test=undo]').click();
      waitToRenderAllShapes();
      cy.get('[data-test=redo]').click();
      waitToRenderAllShapes();

      cy.get('@boundaryEvent').should($boundaryEvent => {
        const { left, top } = $boundaryEvent.position();

        expect(left).to.equal(boundaryEventPosition.left);
        expect(top).to.equal(boundaryEventPosition.top);
      });
    });
  });
});
