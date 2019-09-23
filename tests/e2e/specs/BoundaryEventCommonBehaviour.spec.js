import {
  connectNodesWithFlow,
  dragFromSourceToDest,
  getComponentsEmbeddedInShape,
  getCrownButtonForElement,
  getElementAtPosition,
  getLinksConnectedToElement,
  moveElementRelativeTo,
  removeIndentationAndLinebreaks,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

const boundaryEventSelector = '.main-paper ' +
  '[data-type="processmaker.components.nodes.task.Shape"] + ' +
  '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';

describe('Boundary Event Common Behaviour', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('removes references of itself when inside of a pool and deleting the pool', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const startEventPosition = { x: 150, y: 150 };
    const poolPosition = { x: 400, y: 300 };
    const taskPosition = { x: 250, y: 250 };

    getElementAtPosition(startEventPosition)
      .click()
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click({ force: true });
      });

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, boundaryTimerEventPosition);

    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition)
      .click()
      .then($task => {
        getCrownButtonForElement($task, 'delete-button').click({ force: true });
      });

    const boundaryTimerEventInXML = '<bpmn:boundaryEvent id="node_3" name="New Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.not.contain(boundaryTimerEventInXML);
      });
  });

  it('can stay anchored to task when moving pool', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }
    const startEventPosition = { x: 150, y: 150 };
    const poolPosition = { x: 300, y: 300 };
    const taskPosition = { x: 250, y: 250 };

    getElementAtPosition(startEventPosition)
      .click()
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click({ force: true });
      });

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, boundaryTimerEventPosition);

    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const initialPositionXML = '<bpmn:boundaryEvent id="node_3" name="New Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(initialPositionXML);
      });

    moveElementRelativeTo({ x: 400, y: 400 }, 150, 150);

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(initialPositionXML);
      });
  });

  it('retains outgoing sequence flows on Boundary Events', function() {

    const taskForTimerPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskForTimerPosition);

    const outgoingTaskPosition = { x: 400, y: 400 };
    dragFromSourceToDest(nodeTypes.task, outgoingTaskPosition);

    const boundaryTimerEventPosition = { x: 260, y: 260 };
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, boundaryTimerEventPosition);

    connectNodesWithFlow('sequence-flow-button', boundaryTimerEventPosition, outgoingTaskPosition);

    const numberOfSequenceFlowsAdded = 1;

    getElementAtPosition(boundaryTimerEventPosition).then(getLinksConnectedToElement).should($links => {
      expect($links.length).to.eq(numberOfSequenceFlowsAdded);
    });

    cy.get('[data-test=undo]').click({ force: true });
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click({ force: true });
    waitToRenderAllShapes();

    getElementAtPosition(boundaryTimerEventPosition).then(getLinksConnectedToElement).should($links => {
      expect($links.length).to.eq(numberOfSequenceFlowsAdded);
    });


  });

  it('cannot attach an incoming sequence flow on Boundary Events', function() {
    const taskForBoundaryEventsPosition = { x: 300, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskForBoundaryEventsPosition);

    const taskPosition = { x: 400, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    const eventPosition = { x: 300, y: 210 };
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, eventPosition);

    connectNodesWithFlow('sequence-flow-button', taskPosition, eventPosition);

    getElementAtPosition(taskPosition).then(getLinksConnectedToElement).should($links => {
      expect($links).to.have.lengthOf(0);
    });

    getElementAtPosition(eventPosition).click().then($boundaryTimerEvent => {
      getCrownButtonForElement($boundaryTimerEvent, 'delete-button').click();
    });
  });

  it('snaps back to original position when dragged over empty area', function() {
    const taskPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, taskPosition);

    const boundaryTimerEventSelector = '.main-paper ' +
      '[data-type="processmaker.components.nodes.task.Shape"] + ' +
      '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';

    cy.get(boundaryTimerEventSelector).then($boundaryEvent => {
      const boundaryTimerEventPosition = $boundaryEvent.position();
      const emptySpot = { x: 400, y: 400 };

      cy.wrap($boundaryEvent)
        .trigger('mousedown', { which: 1, force: true })
        .trigger('mousemove', { clientX: emptySpot.x, clientY: emptySpot.y, force: true })
        .trigger('mouseup');

      waitToRenderAllShapes();

      cy.wrap($boundaryEvent).should($el => {
        const { left, top } = $el.position();
        const positionErrorMargin = 2;
        expect(left).to.be.closeTo(boundaryTimerEventPosition.left, positionErrorMargin);
        expect(top).to.be.closeTo(boundaryTimerEventPosition.top, positionErrorMargin);
      });
    });
  });

  it('does not snap boundary event to new position when selecting', function() {
    const taskPosition = { x: 300, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryEventPosition = { x: 300, y: 250 };
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, boundaryEventPosition);

    const boundaryEventConnectedPosition = { x: 282, y: 239 };
    getElementAtPosition(boundaryEventPosition).getPosition().should('contain', boundaryEventConnectedPosition);
    getElementAtPosition(boundaryEventPosition).click();
    getElementAtPosition(boundaryEventPosition).getPosition().should('contain', boundaryEventConnectedPosition);
  });

  it('correctly re-renders a boundary event on undo and redo', () => {
    const taskPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, taskPosition);

    cy.get('[data-test=undo]').click({ force: true });
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click({ force: true });
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition, nodeTypes.task)
      .then(getComponentsEmbeddedInShape)
      .then(events => events[0])
      .then($event => {
        cy.window()
          .its('store.state.graph')
          .invoke('getCell', $event.attr('model-id'))
          .should(shape => expect(shape.component.node.type).to.eq(nodeTypes.boundaryTimerEvent));
      });
  });

  it('can successfully undo/redo after dragging onto invalid (empty) space ', function() {
    const taskPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, taskPosition);

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
    const boundaryTimerEventPosition = { x: 300, y: 350 };
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, boundaryTimerEventPosition);

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
