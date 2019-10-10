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

const boundaryEventPosition = { x: 250, y: 250 };
const taskPosition = { x: 250, y: 200 };

const boundaryEventData = [
  {
    type: 'Boundary Timer Event',
    nodeType: nodeTypes.boundaryTimerEvent,
    eventXMLSnippet: '<bpmn:boundaryEvent id="node_3" name="New Boundary Timer Event" attachedToRef="node_2" configuration="null" timing-control="null"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>',
  },
  {
    type: 'Boundary Error Event',
    nodeType: nodeTypes.boundaryErrorEvent,
    eventXMLSnippet: '<bpmn:boundaryEvent id="node_3" name="New Boundary Error Event" attachedToRef="node_2" configuration="null"><bpmn:errorEventDefinition /></bpmn:boundaryEvent>',
  },
];

boundaryEventData.forEach(({ type, nodeType, eventXMLSnippet }) => {
  function configurePool(poolPosition) {
    getElementAtPosition({ x: 150, y: 150 })
      .click()
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click({ force: true });
      });

    dragFromSourceToDest(nodeTypes.task, { x: 250, y: 250 });
    dragFromSourceToDest(nodeType, boundaryEventPosition);
    dragFromSourceToDest(nodeTypes.pool, poolPosition);
  }

  describe(`Common behaviour test for boundary event type ${type}`, () => {
    it('can render a boundary event of this type', function() {
      dragFromSourceToDest(nodeTypes.task, taskPosition);

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
      configurePool(poolPosition);

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
      configurePool({ x: 300, y: 300 });
      cy.get('[data-test=downloadXMLBtn]').click();
      cy.window()
        .its('xml')
        .then(removeIndentationAndLinebreaks)
        .then(xml => {
          const boundaryEventPositionXml = 'bpmndi:BPMNShape id="node_3_di" bpmnElement="node_3"><dc:Bounds x="232" y="251"';
          expect(xml).to.contain(eventXMLSnippet);
          expect(xml).to.contain(boundaryEventPositionXml);
        });

      moveElementRelativeTo({ x: 400, y: 400 }, 150, 150);

      cy.get('[data-test=downloadXMLBtn]').click();
      cy.window()
        .its('xml')
        .then(removeIndentationAndLinebreaks)
        .then(xml => {
          const boundaryEventPositionXml = 'bpmndi:BPMNShape id="node_3_di" bpmnElement="node_3"><dc:Bounds x="662" y="481"';
          expect(xml).to.contain(eventXMLSnippet);
          expect(xml).to.contain(boundaryEventPositionXml);
        });
    });

    it('retains outgoing sequence flows on Boundary Events', function() {
      dragFromSourceToDest(nodeTypes.task, taskPosition);

      const outgoingTaskPosition = { x: 400, y: 400 };
      dragFromSourceToDest(nodeTypes.task, outgoingTaskPosition);

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
      dragFromSourceToDest(nodeTypes.task, firstTaskPosition);

      dragFromSourceToDest(nodeTypes.task, taskPosition);
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
      dragFromSourceToDest(nodeTypes.task, taskPosition);
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
      dragFromSourceToDest(nodeTypes.task, taskPosition);

      dragFromSourceToDest(nodeType, boundaryEventPosition);

      const boundaryEventConnectedPosition = { x: 232, y: 239 };
      getElementAtPosition(boundaryEventPosition).getPosition().should('contain', boundaryEventConnectedPosition);
      getElementAtPosition(boundaryEventPosition).click();
      getElementAtPosition(boundaryEventPosition).getPosition().should('contain', boundaryEventConnectedPosition);
    });

    it('correctly re-renders a boundary event on undo and redo', () => {
      dragFromSourceToDest(nodeTypes.task, taskPosition);
      dragFromSourceToDest(nodeType, taskPosition);

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
            .should(shape => expect(shape.component.node.type).to.eq(nodeType));
        });
    });

    it('can successfully undo/redo after dragging onto invalid (empty) space ', function() {
      dragFromSourceToDest(nodeTypes.task, taskPosition);
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
      dragFromSourceToDest(nodeTypes.task, taskPosition);
      dragFromSourceToDest(nodeType, boundaryEventPosition);

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
});
