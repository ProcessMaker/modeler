import {
  addNodeTypeToPaper,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getComponentsEmbeddedInShape,
  getCrownButtonForElement,
  getElementAtPosition,
  getLinksConnectedToElement,
  moveElement,
  moveElementRelativeTo,
  removeIndentationAndLinebreaks,
  setBoundaryEvent,
  waitToRenderAllShapes,
} from './utils';
import { boundaryEventSelector, nodeTypes } from './constants';
import { invalidNodeColor, poolColor, startColor } from '../../../src/components/nodeColors';

const boundaryEventPosition = { x: 280, y: 200 };
const taskPosition = { x: 250, y: 200 };


function testThatBoundaryEventIsCloseToTask(boundaryEvent, task) {
  const boundaryPosition = boundaryEvent.position();
  const taskPosition = task.position();

  expect(boundaryPosition.top).to.be.closeTo(taskPosition.top, 1);
  expect(boundaryPosition.left).to.be.closeTo(taskPosition.left, 118);
}

function configurePool(poolPosition, nodeType, taskType, taskTypeSelector) {
  const taskPosition = { x: 250, y: 250 };
  getElementAtPosition({ x: 150, y: 150 })
    .click()
    .then($startEvent => {
      getCrownButtonForElement($startEvent, 'delete-button').click({ force: true });
    });

  addNodeTypeToPaper({ x: 250, y: 250 }, nodeTypes.task, taskTypeSelector);
  setBoundaryEvent(nodeType, taskPosition, taskType);
  dragFromSourceToDest(nodeTypes.pool, poolPosition);
}

export function CommonBoundaryEventBehaviour({ type, nodeType, eventXMLSnippet, taskType, taskTypeSelector, invalidTargets, skip = false }) {
  (skip ? describe.skip : describe)(`Common behaviour test for boundary event type ${ type }`, () => {
    it('can render a boundary event of this type', () => {
      waitToRenderAllShapes();
      addNodeTypeToPaper(taskPosition, nodeTypes.task, taskTypeSelector);

      setBoundaryEvent(nodeType, taskPosition, taskType);
      getElementAtPosition(boundaryEventPosition, nodeType).click();

      cy.get('[data-test=downloadXMLBtn]').click();

      cy.window()
        .its('xml')
        .then(removeIndentationAndLinebreaks)
        .then(xml => {
          expect(xml).to.contain(eventXMLSnippet);
        });
    });

    it('removes references of itself when inside of a pool and deleting the pool', () => {
      const poolPosition = { x: 400, y: 300 };
      configurePool(poolPosition, nodeType, taskType, taskTypeSelector);

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

    it('can stay anchored to task when moving pool', () => {
      configurePool({ x: 300, y: 300 }, nodeType, taskType, taskTypeSelector);
      const taskSelector = '.main-paper ' +
        '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';

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

    it('retains outgoing sequence flows on Boundary Events', () => {
      addNodeTypeToPaper(taskPosition, nodeTypes.task, taskTypeSelector);

      const outgoingTaskPosition = { x: 400, y: 400 };
      addNodeTypeToPaper(outgoingTaskPosition, nodeTypes.task, taskTypeSelector);

      setBoundaryEvent(nodeType, outgoingTaskPosition, taskType);
      moveElement(outgoingTaskPosition, boundaryEventPosition.x, boundaryEventPosition.y);
      connectNodesWithFlow('generic-flow-button', boundaryEventPosition, outgoingTaskPosition);
      waitToRenderAllShapes();

      const numberOfSequenceFlowsAdded = 1;

      getElementAtPosition(boundaryEventPosition, nodeType).then(getLinksConnectedToElement).should($links => {
        expect($links.length).to.eq(numberOfSequenceFlowsAdded);
      });

      cy.get('[data-test=undo]').click({ force: true });
      waitToRenderAllShapes();
      cy.get('[data-test=redo]').click({ force: true });
      waitToRenderAllShapes();

      getElementAtPosition(boundaryEventPosition, nodeType).then(getLinksConnectedToElement).should($links => {
        expect($links.length).to.eq(numberOfSequenceFlowsAdded);
      });
    });

    it('cannot attach an incoming sequence flow on Boundary Events', () => {
      const firstTaskPosition = { x: 400, y: 400 };
      addNodeTypeToPaper(firstTaskPosition, nodeTypes.task, taskTypeSelector);

      addNodeTypeToPaper(taskPosition, nodeTypes.task, taskTypeSelector);
      setBoundaryEvent(nodeType, taskPosition, taskType);

      connectNodesWithFlow('generic-flow-button', firstTaskPosition, boundaryEventPosition);

      getElementAtPosition(taskPosition).then(getLinksConnectedToElement).should($links => {
        expect($links).to.have.lengthOf(0);
      });

      getElementAtPosition(boundaryEventPosition, nodeType).click().then($boundaryEvent => {
        getCrownButtonForElement($boundaryEvent, 'delete-button').click();
      });
    });

    it('snaps back to original position when dragged over empty area', () => {
      addNodeTypeToPaper(taskPosition, nodeTypes.task, taskTypeSelector);
      setBoundaryEvent(nodeType, taskPosition, taskType);

      cy.get(boundaryEventSelector).then($boundaryEvent => {
        const boundaryEventPosition = $boundaryEvent.position();
        const emptySpot = { x: 400, y: 400 };

        cy.wrap($boundaryEvent)
          .trigger('mousedown', { which: 1, force: true })
          .trigger('mousemove', { clientX: emptySpot.x, clientY: emptySpot.y, force: true })
          .trigger('mouseup');

        waitToRenderAllShapes();

        cy.wrap($boundaryEvent).should($el => {
          const { left, top } = $el.position();
          const positionErrorMargin = 20;
          expect(left).to.be.closeTo(boundaryEventPosition.left, positionErrorMargin);
          expect(top).to.be.closeTo(boundaryEventPosition.top, positionErrorMargin);
        });
      });
    });

    it('does not snap boundary event to new position when selecting', () => {
      addNodeTypeToPaper(taskPosition, nodeTypes.task, taskTypeSelector);

      const boundaryEventConnectedPosition = { x: 290, y: 182 };
      setBoundaryEvent(nodeType, taskPosition, taskType);

      getElementAtPosition(boundaryEventPosition, nodeType)
        .getPosition()
        .should('contain', boundaryEventConnectedPosition);
      getElementAtPosition(boundaryEventPosition, nodeType).click();
      getElementAtPosition(boundaryEventPosition, nodeType)
        .getPosition()
        .should('contain', boundaryEventConnectedPosition);
    });

    it('correctly re-renders a boundary event on undo and redo', () => {
      addNodeTypeToPaper(taskPosition, nodeTypes.task, taskTypeSelector);
      setBoundaryEvent(nodeType, taskPosition, taskType);
      moveElement(taskPosition, boundaryEventPosition.x, boundaryEventPosition.y);

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

    it('can successfully undo/redo after dragging onto invalid (empty) space ', () => {
      addNodeTypeToPaper(taskPosition, nodeTypes.task, taskTypeSelector);
      setBoundaryEvent(nodeType, taskPosition, taskType);

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

          expect(left).to.be.closeTo(boundaryEventPosition.left, 20);
          expect(top).to.be.closeTo(boundaryEventPosition.top, 20);
        });
      });

      getElementAtPosition(taskPosition);
      getElementAtPosition(taskPosition, taskType)
        .then(getComponentsEmbeddedInShape)
        .should($elements => {
          expect($elements).to.have.lengthOf(1);
        });
    });

    it('redo positions it in same location as before undo', () => {
      addNodeTypeToPaper(taskPosition, nodeTypes.task, taskTypeSelector);
      setBoundaryEvent(nodeType, taskPosition, taskType);

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

    it('turns target red when it is an invalid drop target, and snaps back to original position', () => {
      addNodeTypeToPaper(taskPosition, nodeTypes.task, taskTypeSelector);
      setBoundaryEvent(nodeType, taskPosition, taskType);
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

    it('should turn pool red when hovered over and then back to default colour when no longer over pool', () => {
      dragFromSourceToDest(nodeTypes.pool, taskPosition);
      addNodeTypeToPaper(taskPosition, nodeTypes.task, taskTypeSelector);
      setBoundaryEvent(nodeType, taskPosition, taskType);
      getElementAtPosition(taskPosition, nodeType).then($boundaryEvent => {
        const overPoolPosition = { x: 450, y: 450 };
        const overTaskPosition = { x: 550, y: 350 };

        [overPoolPosition, overTaskPosition].forEach(({ x, y }) => {
          cy.wrap($boundaryEvent)
            .as('boundaryEvent')
            .click({ force: true })
            .trigger('mousedown', { which: 1, force: true });
          waitToRenderAllShapes();
          cy.get('@boundaryEvent').trigger('mousemove', { clientX: x, clientY: y, force: true });

          waitToRenderAllShapes();

          getElementAtPosition(taskPosition, nodeTypes.pool)
            .then($el => $el.find('[joint-selector="body"]'))
            .should('have.attr', 'fill', invalidNodeColor);

          cy.wrap($boundaryEvent).trigger('mouseup');

          waitToRenderAllShapes();

          getElementAtPosition(taskPosition, nodeTypes.pool)
            .then($el => $el.find('[joint-selector="body"]'))
            .should('have.attr', 'fill', poolColor);
        });
      });
    });

    it('highlight boundary event on creation', () => {
      addNodeTypeToPaper(taskPosition, nodeTypes.task, taskTypeSelector);
      setBoundaryEvent(nodeType, taskPosition, taskType);

      getElementAtPosition(boundaryEventPosition).click().children().should('have.class', 'joint-highlight-stroke');
    });
  });
}
