import {
  dragFromSourceToDest,
  getComponentsEmbeddedInShape,
  getElementAtPosition,
  getGraphElements,
  getPositionInPaperCoords,
  moveElement,
  removeIndentationAndLinebreaks,
  typeIntoTextInput,
  uploadXml,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Boundary Timer Event', () => {
  it('update boundary timer event properties element', function() {
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

  it('Can drag boundary timer events over valid targets', function() {
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
      '[data-type="processmaker.components.nodes.task.Shape"] ~ ' +
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
          });
      });
    });
  });

  it('keeps Boundary Timer Event in correct position when dragging and dropping', function() {
    const taskPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    dragFromSourceToDest(nodeTypes.boundaryTimerEvent, taskPosition);

    const task2Position = { x: 500, y: 500 };
    dragFromSourceToDest(nodeTypes.task, task2Position);

    const boundaryTimerEventSelector = '.main-paper ' +
      '[data-type="processmaker.components.nodes.task.Shape"] ~ ' +
      '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';

    getPositionInPaperCoords(task2Position).then(newPosition => {
      cy.get(boundaryTimerEventSelector).then($boundaryEvent => {
        cy.wrap($boundaryEvent)
          .trigger('mousedown', { which: 1, force: true })
          .trigger('mousemove', { clientX: newPosition.x, clientY: newPosition.y, force: true })
          .trigger('mouseup')
          .then(waitToRenderAllShapes)
          .then(() => {
            const initialBoundaryEventPosition = $boundaryEvent.position();
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
