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
import { boundaryEventSelector, nodeTypes } from '../support/constants';
import { startColor, defaultNodeColor, invalidNodeColor } from '../../../src/components/nodeColors';

const boundaryEventPosition = { x: 250, y: 250 };
const taskPosition = { x: 250, y: 200 };

const boundaryEventData = [{
  type: 'Boundary Timer Event',
  nodeType: nodeTypes.boundaryTimerEvent,
  eventXMLSnippet: '<bpmn:boundaryEvent id="node_3" name="New Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>',
  taskType: nodeTypes.task,
  invalidTargets: [{ type: nodeTypes.startEvent }],
}, {
  type: 'Boundary Error Event',
  nodeType: nodeTypes.boundaryErrorEvent,
  eventXMLSnippet: '<bpmn:boundaryEvent id="node_3" name="New Boundary Error Event" attachedToRef="node_2"><bpmn:errorEventDefinition /></bpmn:boundaryEvent>',
  taskType: nodeTypes.task,
  invalidTargets: [{ type: nodeTypes.startEvent }],
}, {
  type: 'Boundary Escalation Event',
  nodeType: nodeTypes.boundaryEscalationEvent,
  eventXMLSnippet: '<bpmn:boundaryEvent id="node_3" name="New Boundary Escalation Event" attachedToRef="node_2"><bpmn:escalationEventDefinition /></bpmn:boundaryEvent>',
  taskType: nodeTypes.callActivity,
  invalidTargets: [{ type: nodeTypes.startEvent }, { type: nodeTypes.task, color: defaultNodeColor }],
}, {
  type: 'Boundary Message Event',
  nodeType: nodeTypes.boundaryMessageEvent,
  eventXMLSnippet: '<bpmn:boundaryEvent id="node_3" name="New Boundary Message Event" attachedToRef="node_2"><bpmn:messageEventDefinition /></bpmn:boundaryEvent>',
  taskType: nodeTypes.callActivity,
  invalidTargets: [{ type: nodeTypes.startEvent }],
}];

function testThatBoundaryEventIsCloseToTask(boundaryEvent, task) {
  const boundaryPosition = boundaryEvent.position();
  const taskPosition = task.position();

  expect(boundaryPosition.top).to.be.closeTo(taskPosition.top, 1);
  expect(boundaryPosition.left).to.be.closeTo(taskPosition.left, 118);
}

function configurePool(poolPosition, nodeType, taskType) {
  getElementAtPosition({ x: 150, y: 150 })
    .click()
    .then($startEvent => {
      getCrownButtonForElement($startEvent, 'delete-button').click({ force: true });
    });

  dragFromSourceToDest(taskType, { x: 250, y: 250 });
  dragFromSourceToDest(nodeType, boundaryEventPosition);
  dragFromSourceToDest(nodeTypes.pool, poolPosition);
}

boundaryEventData.forEach(({ type, nodeType, eventXMLSnippet, taskType, invalidTargets }) => {
  describe(`Common behaviour test for boundary event type ${type}`, () => {
    it('can render a boundary event of this type', function() {
      dragFromSourceToDest(taskType, taskPosition);

      dragFromSourceToDest(nodeType, boundaryEventPosition);

      getElementAtPosition(boundaryEventPosition).click();

      cy.get('[data-test=downloadXMLBtn]').click();

      cy.window()
        .its('xml')
        .then(removeIndentationAndLinebreaks)
        .then(xml => {
          expect(xml).to.contain(eventXMLSnippet);
        });
    });

    it('removes references of itself when inside of a pool and deleting the pool', function() {
      const poolPosition = { x: 400, y: 300 };
      configurePool(poolPosition, nodeType, taskType);

      getElementAtPosition(poolPosition)
        .click()
        .then($task => {
          getCrownButtonForElement($task, 'delete-button').click({ force: true });
        });
      cy.get('[data-test=downloadXMLBtn]').click();

      cy.window()
        .its('xml')
        .then(removeIndentationAndLinebreaks)
        .then(xml => {
          expect(xml).to.not.contain(eventXMLSnippet);
        });
    });

    it('can stay anchored to task when moving pool', function() {
      configurePool({ x: 300, y: 300 }, nodeType, taskType);

      const taskSelector = '.main-paper ' +
        '[data-type="processmaker.components.nodes.task.Shape"]';

      cy.get(boundaryEventSelector).then($boundaryEvent => {
        cy.get(taskSelector).then($task => {
          testThatBoundaryEventIsCloseToTask($boundaryEvent, $task);
        });
      });

      cy.get('[data-test=downloadXMLBtn]').click();
      cy.window()
        .its('xml')
        .then(removeIndentationAndLinebreaks)
        .then(xml => {
          expect(xml).to.contain(eventXMLSnippet);
        });

      moveElementRelativeTo({ x: 400, y: 400 }, 50, 50);
      waitToRenderAllShapes();
      cy.get(boundaryEventSelector).then($boundaryEvent => {
        cy.get(taskSelector).then($task => {
          testThatBoundaryEventIsCloseToTask($boundaryEvent, $task);
        });
      });

      cy.get('[data-test=downloadXMLBtn]').click();
      cy.window()
        .its('xml')
        .then(removeIndentationAndLinebreaks)
        .then(xml => {
          expect(xml).to.contain(eventXMLSnippet);
        });
    });

    it('retains outgoing sequence flows on Boundary Events', function() {
      dragFromSourceToDest(taskType, taskPosition);

      const outgoingTaskPosition = { x: 400, y: 400 };
      dragFromSourceToDest(taskType, outgoingTaskPosition);

      dragFromSourceToDest(nodeType, boundaryEventPosition);

      connectNodesWithFlow('sequence-flow-button', boundaryEventPosition, outgoingTaskPosition);

      const numberOfSequenceFlowsAdded = 1;

      getElementAtPosition(boundaryEventPosition).then(getLinksConnectedToElement).should($links => {
        expect($links.length).to.eq(numberOfSequenceFlowsAdded);
      });

      cy.get('[data-test=undo]').click({ force: true });
      waitToRenderAllShapes();
      cy.get('[data-test=redo]').click({ force: true });
      waitToRenderAllShapes();

      getElementAtPosition(boundaryEventPosition).then(getLinksConnectedToElement).should($links => {
        expect($links.length).to.eq(numberOfSequenceFlowsAdded);
      });
    });

    it('cannot attach an incoming sequence flow on Boundary Events', function() {
      const firstTaskPosition = { x: 400, y: 400 };
      dragFromSourceToDest(taskType, firstTaskPosition);

      dragFromSourceToDest(taskType, taskPosition);
      dragFromSourceToDest(nodeType, boundaryEventPosition);

      connectNodesWithFlow('sequence-flow-button', firstTaskPosition, boundaryEventPosition);

      getElementAtPosition(taskPosition).then(getLinksConnectedToElement).should($links => {
        expect($links).to.have.lengthOf(0);
      });

      getElementAtPosition(boundaryEventPosition).click().then($boundaryEvent => {
        getCrownButtonForElement($boundaryEvent, 'delete-button').click();
      });
    });

    it('snaps back to original position when dragged over empty area', function() {
      dragFromSourceToDest(taskType, taskPosition);
      dragFromSourceToDest(nodeType, taskPosition);

      cy.get(boundaryEventSelector).then($boundaryEvent => {
        const boundaryEventPosition = $boundaryEvent.position();
        const emptySpot = { x: 400, y: 400 };

        cy.wrap($boundaryEvent)
          .trigger('mousedown', { which: 1, force: true })
          .trigger('mousemove', { clientX: emptySpot.x, clientY: emptySpot.y, force: true })
          .trigger('mouseup');

        waitToRenderAllShapes();

        getElementAtPosition(taskPosition).click();

        cy.wrap($boundaryEvent).should($el => {
          const { left, top } = $el.position();
          const positionErrorMargin = 2;
          expect(left).to.be.closeTo(boundaryEventPosition.left, positionErrorMargin);
          expect(top).to.be.closeTo(boundaryEventPosition.top, positionErrorMargin);
        });
      });
    });

    it('does not snap boundary event to new position when selecting', function() {
      dragFromSourceToDest(taskType, taskPosition);

      dragFromSourceToDest(nodeType, boundaryEventPosition);

      const boundaryEventConnectedPosition = { x: 232, y: 239 };
      getElementAtPosition(boundaryEventPosition).getPosition().should('contain', boundaryEventConnectedPosition);
      getElementAtPosition(boundaryEventPosition).click();
      getElementAtPosition(boundaryEventPosition).getPosition().should('contain', boundaryEventConnectedPosition);
    });

    it('correctly re-renders a boundary event on undo and redo', () => {
      dragFromSourceToDest(taskType, taskPosition);
      dragFromSourceToDest(nodeType, taskPosition);

      cy.get('[data-test=undo]').click({ force: true });
      waitToRenderAllShapes();
      cy.get('[data-test=redo]').click({ force: true });
      waitToRenderAllShapes();

      getElementAtPosition(taskPosition, taskType)
        .then(getComponentsEmbeddedInShape)
        .then(events => events[0])
        .then($event => {
          cy.window()
            .its('store.state.graph')
            .invoke('getCell', $event.attr('model-id'))
            .should(shape => expect(shape.component.node.type).to.eq(nodeType));
        });
    });

    it('can successfully undo/redo after dragging onto invalid (empty) space ', function() {
      dragFromSourceToDest(taskType, taskPosition);
      dragFromSourceToDest(nodeType, taskPosition);

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

          expect(left).to.be.closeTo(boundaryEventPosition.left, 2);
          expect(top).to.be.closeTo(boundaryEventPosition.top, 2);
        });
      });

      getElementAtPosition(taskPosition);
      getElementAtPosition(taskPosition, taskType)
        .then(getComponentsEmbeddedInShape)
        .should($elements => {
          expect($elements).to.have.lengthOf(1);
        });
    });

    it('redo positions it in same location as before undo', function() {
      dragFromSourceToDest(taskType, taskPosition);
      dragFromSourceToDest(nodeType, boundaryEventPosition);

      cy.get(boundaryEventSelector).as('boundaryEvent').then($boundaryEvent => {
        const boundaryEventPosition = $boundaryEvent.position();

        cy.get('[data-test=undo]').click();
        waitToRenderAllShapes();
        cy.get('[data-test=redo]').click();
        waitToRenderAllShapes();

        cy.get('@boundaryEvent').should($boundaryEvent => {
          const { left, top } = $boundaryEvent.position();

          expect(left).to.closeTo(boundaryEventPosition.left, 2);
          expect(top).to.closeTo(boundaryEventPosition.top, 2);
        });
      });
    });

    it('turns target red when it is an invalid drop target, and snaps back to original position', function() {
      dragFromSourceToDest(taskType, taskPosition);
      dragFromSourceToDest(nodeType, taskPosition);
      const invalidNodeTargetPosition = { x: 450, y: 150 };

      invalidTargets.forEach(invalidTargetNode => {
        dragFromSourceToDest(invalidTargetNode.type, invalidNodeTargetPosition);

        cy.window().its('store.state.paper').then(paper => {
          const newPosition = paper.localToPagePoint(invalidNodeTargetPosition.x, invalidNodeTargetPosition.y);

          cy.get(boundaryEventSelector).then($boundaryEvent => {
            const boundaryEventPosition = $boundaryEvent.position();

            cy.wrap($boundaryEvent)
              .trigger('mousedown', { which: 1, force: true })
              .then($boundaryEvent => {
                waitToRenderAllShapes();
                cy.wrap($boundaryEvent)
                  .trigger('mousemove', { clientX: newPosition.x, clientY: newPosition.y, force: true });
              });

            waitToRenderAllShapes();

            getElementAtPosition(invalidNodeTargetPosition, invalidTargetNode.type)
              .then($el => $el.find('[joint-selector="body"]'))
              .should('have.attr', 'fill', invalidNodeColor);

            cy.wrap($boundaryEvent).trigger('mouseup');

            waitToRenderAllShapes();

            getElementAtPosition(invalidNodeTargetPosition, invalidTargetNode.type)
              .then($el => $el.find('[joint-selector="body"]'))
              .should('have.attr', 'fill', invalidTargetNode.color || startColor);

            getElementAtPosition(invalidNodeTargetPosition).click();

            cy.wrap($boundaryEvent).should($el => {
              const { left, top } = $el.position();
              const positionErrorMargin = 2;
              expect(left).to.be.closeTo(boundaryEventPosition.left, positionErrorMargin);
              expect(top).to.be.closeTo(boundaryEventPosition.top, positionErrorMargin);
            });
          });
        });

        getElementAtPosition(invalidNodeTargetPosition).then($element => {
          getCrownButtonForElement($element, 'delete-button').click();
        });
      });
    });
  });
});
