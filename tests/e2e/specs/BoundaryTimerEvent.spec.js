import {
  connectNodesWithFlow,
  dragFromSourceToDest,
  getComponentsEmbeddedInShape,
  getCrownButtonForElement,
  getElementAtPosition,
  getGraphElements,
  getLinksConnectedToElement,
  getPositionInPaperCoords,
  moveElement,
  moveElementRelativeTo,
  removeIndentationAndLinebreaks,
  typeIntoTextInput,
  uploadXml,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';
import { defaultNodeColor, invalidNodeColor } from '../../../src/components/nodeColors';

const boundaryEventSelector = '.main-paper ' +
    '[data-type="processmaker.components.nodes.task.Shape"] + ' +
    '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';

describe('Boundary Timer Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Render a boundary timer event', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 260, y: 260 };
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, boundaryTimerEventPosition);

    getElementAtPosition(boundaryTimerEventPosition).click();

    const boundaryTimerEventXML = '<bpmn:boundaryEvent id="node_3" name="New Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(boundaryTimerEventXML);
      });
  });

  it('update properties element', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 260, y: 260 };
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, boundaryTimerEventPosition);

    getElementAtPosition(boundaryTimerEventPosition).click();

    const name = 'Test name';
    typeIntoTextInput('[name=name]', name);

    const timingControlAccordion = '.fa-clock';
    cy.get(timingControlAccordion).click();

    const durationValue = 4;
    typeIntoTextInput('.repeat', durationValue);

    const durationXML = '<bpmn:boundaryEvent id="node_3" name="Test name" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT4H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(durationXML);
      });

    cy.get('[data-test=intermediateTypeSelect]').select('Cycle');
    const cycleValue = '6';
    cy.get('[data-test=periods]').select('day');
    typeIntoTextInput('.repeat', cycleValue);

    const cycleXML = '<bpmn:boundaryEvent id="node_3" name="Test name" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeCycle>R/P6D</bpmn:timeCycle></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(cycleXML);
      });
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

  it('Can drag boundary timer events over valid targets, but not over invalid targets', function() {
    const initialNumberOfElements = 1;
    const startEventPosition = { x: 150, y: 150 };

    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, startEventPosition);
    getGraphElements().should('have.length', initialNumberOfElements);

    const validBoundaryTimerEventTargets = [
      { type: nodeTypes.task, position: { x: 100, y: 300 } },
      { type: nodeTypes.callActivity, position: { x: 240, y: 300 } },
      { type: nodeTypes.scriptTask, position: { x: 380, y: 300 } },
      { type: nodeTypes.manualTask, position: { x: 100, y: 400 } },
      { type: nodeTypes.sendTweet, position: { x: 240, y: 400 } },
      { type: nodeTypes.taskWithMarker, position: { x: 380, y: 400 } },
    ];

    validBoundaryTimerEventTargets.forEach(({ type, position }) => {
      dragFromSourceToDest(type, position);
    });

    const numberOfElementsAfterAddingTasks = initialNumberOfElements + validBoundaryTimerEventTargets.length;
    getGraphElements().should('have.length', numberOfElementsAfterAddingTasks);

    validBoundaryTimerEventTargets.forEach(({ position }) => {
      dragFromSourceToDest(nodeTypes.boundaryTimerEvent, position);
    });

    const numberOfElementsAfterAddingTasksAndBoundaryTimerEvents = initialNumberOfElements + validBoundaryTimerEventTargets.length * 2;
    getGraphElements().should('have.length', numberOfElementsAfterAddingTasksAndBoundaryTimerEvents);
  });

  it('can toggle interrupting on Boundary Timer Events', function() {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 260, y: 260 };
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, boundaryTimerEventPosition);

    getElementAtPosition(boundaryTimerEventPosition).click();

    const interrupting = '[name=cancelActivity]';
    cy.get(interrupting).should('be.checked');

    cy.get('[data-test=undo]').click({ force: true });
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click({ force: true });
    waitToRenderAllShapes();

    getElementAtPosition(boundaryTimerEventPosition).click();

    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({ force: true });
    cy.get(interrupting).should('not.be.checked');

  });

  it('retains outgoing sequence flows on Boundary Timer Events', function() {

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

  it('cannot attach an incoming sequence flow on Boundary Timer Events', function() {
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

  it('can toggle interrupting on Boundary Timer Events in multiple processes', function() {
    uploadXml('boundaryTimersInPools.xml');

    const boundaryTimerEventPositions = [{ x: 277, y: 162 }, { x: 225, y: 379 }];

    getElementAtPosition(boundaryTimerEventPositions[0]).click();

    const interrupting = '[name=cancelActivity]';
    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({ force: true });
    cy.get(interrupting).should('not.be.checked');

    getElementAtPosition(boundaryTimerEventPositions[1]).click({ force: true });

    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({ force: true });
    cy.get(interrupting).should('not.be.checked');
  });

  it('turns target red when it is an invalid drop target, and snaps back to original position', function() {
    const taskPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, taskPosition);

    const startEventSelector = '.main-paper [data-type="processmaker.components.nodes.startEvent.Shape"]';
    const startEventPosition = { x: 150, y: 150 };

    return cy.window().its('store.state.paper').then(paper => {
      const newPosition = paper.localToPagePoint(startEventPosition.x, startEventPosition.y);

      cy.get(boundaryEventSelector).then($boundaryEvent => {
        const boundaryEventPosition = $boundaryEvent.position();

        cy.wrap($boundaryEvent)
          .trigger('mousedown', { which: 1, force: true })
          .trigger('mousemove', { clientX: newPosition.x, clientY: newPosition.y, force: true });

        waitToRenderAllShapes();

        cy.get(startEventSelector)
          .then($el => $el.find('[joint-selector="body"]'))
          .should('have.attr', 'fill', invalidNodeColor);

        cy.wrap($boundaryEvent).trigger('mouseup');

        waitToRenderAllShapes();

        cy.get(startEventSelector)
          .then($el => $el.find('[joint-selector="body"]'))
          .should('have.attr', 'fill', defaultNodeColor);

        cy.wrap($boundaryEvent).should($el => {
          const { left, top } = $el.position();
          const positionErrorMargin = 2;
          expect(left).to.be.closeTo(boundaryEventPosition.left, positionErrorMargin);
          expect(top).to.be.closeTo(boundaryEventPosition.top, positionErrorMargin);
        });
      });
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

  it('moves to another task when dragged over', function() {
    const taskPosition = { x: 300, y: 300 };
    const numberOfBoundaryTimerEventsAdded = 1;
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, taskPosition);

    const taskXml = '<bpmn:task id="node_2" name="Task" />';
    const boundaryEventOnTaskXml = '<bpmn:boundaryEvent id="node_3" name="New Boundary Timer Event" attachedToRef="node_2">';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(taskXml);
        expect(xml).to.contain(boundaryEventOnTaskXml);
      });

    const task2Position = { x: 500, y: 500 };
    dragFromSourceToDest(nodeTypes.task, task2Position);

    const boundaryTimerEventSelector = '.main-paper ' +
      '[data-type="processmaker.components.nodes.task.Shape"] + ' +
      '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';

    getPositionInPaperCoords(task2Position).then(newPosition => {
      cy.get(boundaryTimerEventSelector).then($boundaryEvent => {
        cy.wrap($boundaryEvent)
          .trigger('mousedown', { which: 1, force: true })
          .trigger('mousemove', { clientX: newPosition.x, clientY: newPosition.y, force: true })
          .trigger('mouseup')
          .then(waitToRenderAllShapes)
          .then(() => {
            const task2Xml = '<bpmn:task id="node_4" name="Task" />';
            const boundaryEventOnTask2Xml = '<bpmn:boundaryEvent id="node_3" name="New Boundary Timer Event" attachedToRef="node_4">';

            cy.get('[data-test=downloadXMLBtn]').click();
            cy.window()
              .its('xml')
              .then(removeIndentationAndLinebreaks)
              .then(xml => {
                expect(xml).to.contain(task2Xml);
                expect(xml).to.not.contain(boundaryEventOnTaskXml);
                expect(xml).to.contain(boundaryEventOnTask2Xml);
              });

            const initialBoundaryEventPosition = $boundaryEvent.position();

            getElementAtPosition(taskPosition)
              .then(getComponentsEmbeddedInShape)
              .should($elements => {
                expect($elements).to.have.lengthOf(0);
              });

            getElementAtPosition(task2Position, nodeTypes.task)
              .then(getComponentsEmbeddedInShape)
              .should($elements => {
                expect($elements).to.have.lengthOf(numberOfBoundaryTimerEventsAdded);
              });

            moveElement(taskPosition, 200, 400);
            waitToRenderAllShapes();
            cy.wrap($boundaryEvent).should($el => {
              const { left, top } = $el.position();
              const positionErrorMargin = 2;
              expect(left).to.be.closeTo(initialBoundaryEventPosition.left, positionErrorMargin);
              expect(top).to.be.closeTo(initialBoundaryEventPosition.top, positionErrorMargin);
            });

            moveElement(task2Position, 300, 500);
            waitToRenderAllShapes();
            cy.wrap($boundaryEvent).should($el => {
              const { left, top } = $el.position();
              const positionErrorMargin = 2;
              expect(left).to.not.be.closeTo(initialBoundaryEventPosition.left, positionErrorMargin);
              expect(top).to.not.be.closeTo(initialBoundaryEventPosition.top, positionErrorMargin);
            });
          });
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

  it('correctly re-renders a boundary timer event on undo and redo', () => {
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
});
