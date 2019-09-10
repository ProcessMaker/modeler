import {
  dragFromSourceToDest,
  connectNodesWithFlow,
  typeIntoTextInput,
  getElementAtPosition,
  removeIndentationAndLinebreaks,
  moveElement,
  moveElementRelativeTo,
  getCrownButtonForElement,
  getGraphElements,
  getLinksConnectedToElement,
  uploadXml,
  waitToRenderAllShapes,
  getPositionInPaperCoords,
  getComponentsEmbeddedInShape,
} from '../support/utils';
import { nodeTypes } from '../support/constants';
import { invalidNodeColor, defaultNodeColor } from '../../../src/components/nodeColors';

describe('Boundary Timer Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it.skip('Render a boundary timer event', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 260, y: 260 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, boundaryTimerEventPosition);

    getElementAtPosition(boundaryTimerEventPosition).click();

    const boundaryTimerEventXML = '<bpmn:boundaryEvent id="node_4" name="New Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(boundaryTimerEventXML);
      });
  });

  it.skip('update properties element', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 260, y: 260 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, boundaryTimerEventPosition);

    getElementAtPosition(boundaryTimerEventPosition).click();

    const name = 'Test name';
    typeIntoTextInput('[name=name]', name);

    const timingControlAccordion = '.fa-clock';
    cy.get(timingControlAccordion).click();

    const durationValue = 4;
    typeIntoTextInput('.repeat', durationValue);

    const durationXML = '<bpmn:boundaryEvent id="node_4" name="Test name" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT4H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

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

    const cycleXML = '<bpmn:boundaryEvent id="node_4" name="Test name" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeCycle>R/P6D</bpmn:timeCycle></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(cycleXML);
      });
  });

  it.skip('render boundary timer event by dragging intermediate event on task', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const intermediateCatchEventPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);

    moveElement(intermediateCatchEventPosition, 200, 200);

    const boundaryTimerEventXML = '<bpmn:boundaryEvent id="node_4" name="New Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(boundaryTimerEventXML);
      });
  });

  it.skip('removes references of itself when inside of a pool and deleting the pool', function() {
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
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, boundaryTimerEventPosition);

    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition)
      .click()
      .then($task => {
        getCrownButtonForElement($task, 'delete-button').click({ force: true });
      });

    const boundaryTimerEventInXML = '<bpmn:boundaryEvent id="node_4" name="New Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.not.contain(boundaryTimerEventInXML);
      });
  });

  it.skip('can stay anchored to task when moving pool', function() {
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
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, boundaryTimerEventPosition);

    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const initialPositionXML = '<bpmn:boundaryEvent id="node_4" name="New Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

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

  it('Can drag boundary event over valid targets, but not over invalid targets', function() {
    const initialNumberOfElements = 1;
    const startEventPosition = { x: 150, y: 150 };

    dragFromSourceToDest(nodeTypes.boundaryEvent, startEventPosition);
    getGraphElements().should('have.length', initialNumberOfElements);

    const validBoundaryEventTargets = [
      { type: nodeTypes.task, position: { x: 100, y: 300 } },
      { type: nodeTypes.callActivity, position: { x: 240, y: 300 } },
      { type: nodeTypes.scriptTask, position: { x: 380, y: 300 } },
      { type: nodeTypes.manualTask, position: { x: 100, y: 400 } },
      { type: nodeTypes.sendTweet, position: { x: 240, y: 400 } },
      { type: nodeTypes.taskWithMarker, position: { x: 380, y: 400 } },
    ];

    validBoundaryEventTargets.forEach(({ type, position }) => {
      dragFromSourceToDest(type, position);
    });

    const numberOfElementsAfterAddingTasks = initialNumberOfElements + validBoundaryEventTargets.length;
    getGraphElements().should('have.length', numberOfElementsAfterAddingTasks);

    validBoundaryEventTargets.forEach(({ position }) => {
      dragFromSourceToDest(nodeTypes.boundaryEvent, position);
    });

    const numberOfElementsAfterAddingTasksAndBoundaryEvents = initialNumberOfElements + validBoundaryEventTargets.length * 2;
    getGraphElements().should('have.length', numberOfElementsAfterAddingTasksAndBoundaryEvents);
  });

  it.skip('can toggle interrupting on Boundary Timer Events', function() {
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

    getElementAtPosition(boundaryTimerEventPosition).click({ force: true });

    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({ force: true });
    cy.get(interrupting).should('not.be.checked');

  });

  it.skip('retains outgoing sequence flows on Boundary Timer Events', function() {

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
    cy.get('[data-test=redo]').click({ force: true });

    getElementAtPosition(boundaryTimerEventPosition).then(getLinksConnectedToElement).should($links => {
      expect($links.length).to.eq(numberOfSequenceFlowsAdded);
    });


  });

  it('cannot attach an incoming sequence flow on Boundary Timer Events');

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
    dragFromSourceToDest(nodeTypes.boundaryEvent, taskPosition);

    const boundaryEventSelector = '.main-paper ' +
      '[data-type="processmaker.components.nodes.task.Shape"] + ' +
      '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';
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
    dragFromSourceToDest(nodeTypes.boundaryEvent, taskPosition);

    const boundaryEventSelector = '.main-paper ' +
      '[data-type="processmaker.components.nodes.task.Shape"] + ' +
      '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';

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
        const positionErrorMargin = 2;
        expect(left).to.be.closeTo(boundaryEventPosition.left, positionErrorMargin);
        expect(top).to.be.closeTo(boundaryEventPosition.top, positionErrorMargin);
      });
    });
  });

  it.only('moves to another task when dragged over', function() {
    const taskPosition = { x: 300, y: 300 };
    const numberOfBoundaryEventsAdded = 1;
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    dragFromSourceToDest(nodeTypes.boundaryEvent, taskPosition);

    const task2Position = { x: 500, y: 500 };
    dragFromSourceToDest(nodeTypes.task, task2Position);

    const boundaryEventSelector = '.main-paper ' +
      '[data-type="processmaker.components.nodes.task.Shape"] + ' +
      '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';

    getPositionInPaperCoords(task2Position).then(newPosition => {
      cy.get(boundaryEventSelector).then($boundaryEvent => {
        cy.wrap($boundaryEvent)
          .trigger('mousedown', { which: 1, force: true })
          .trigger('mousemove', { clientX: newPosition.x, clientY: newPosition.y, force: true })
          .trigger('mouseup')
          .then(waitToRenderAllShapes)
          .then(() => {
            const initialBoundaryEventPosition = $boundaryEvent.position();

            getElementAtPosition(taskPosition)
              .then(getComponentsEmbeddedInShape)
              .should($elements => {
                expect($elements).to.have.lengthOf(0);
              });

            getElementAtPosition(task2Position, nodeTypes.task)
              .then(getComponentsEmbeddedInShape)
              .should($elements => {
                expect($elements).to.have.lengthOf(numberOfBoundaryEventsAdded);
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
});
