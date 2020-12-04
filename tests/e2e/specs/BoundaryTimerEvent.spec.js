import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  dragFromSourceToDest,
  getComponentsEmbeddedInShape,
  getElementAtPosition,
  getGraphElements,
  getPositionInPaperCoords,
  moveElement,
  setBoundaryEvent,
  typeIntoTextInput,
  uploadXml,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';
import { CommonBoundaryEventBehaviour } from '../support/BoundaryEventCommonBehaviour';

describe('Boundary Timer Event', () => {
  it('update boundary timer event properties element', () => {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 260, y: 260 };
    setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);
    moveElement(taskPosition, boundaryTimerEventPosition.x, boundaryTimerEventPosition.y);
    cy.wait(500);

    const name = 'Test name';
    typeIntoTextInput('[name=name]', name);

    const timingControlAccordion = '.fa-clock';
    cy.get(timingControlAccordion).click();

    const durationValue = 4;
    typeIntoTextInput('.repeat', durationValue);

    assertDownloadedXmlContainsExpected(`
      <bpmn:boundaryEvent id="node_3" name="${ name }" attachedToRef="node_2">
        <bpmn:timerEventDefinition>
          <bpmn:timeDuration>PT4H</bpmn:timeDuration>
        </bpmn:timerEventDefinition>
      </bpmn:boundaryEvent>
    `);

    cy.get('[data-test=intermediateTypeSelect]').select('Cycle');
    const cycleValue = '6';
    cy.get('[data-test=periods]').select('day');
    typeIntoTextInput('.repeat', cycleValue);

    assertDownloadedXmlContainsExpected(`
      <bpmn:boundaryEvent id="node_3" name="${ name }" attachedToRef="node_2">
        <bpmn:timerEventDefinition>
          <bpmn:timeCycle>R/P6D</bpmn:timeCycle>
        </bpmn:timerEventDefinition>
      </bpmn:boundaryEvent>
      `);
  });

  it('Can add boundary timer events to valid targets', () => {
    const initialNumberOfElements = 1;
    const startEventPosition = { x: 150, y: 150 };

    getElementAtPosition(startEventPosition).then($startEvent => {
      cy.wrap($startEvent).find('[data-test="boundary-event-dropdown"]').should('not.exist');
    });

    getGraphElements().should('have.length', initialNumberOfElements);

    const validBoundaryTimerEventTargets = [
      { type: nodeTypes.task, position: { x: 100, y: 300 }, selector: 'switch-to-user-task' },
      { type: nodeTypes.subProcess, position: { x: 240, y: 300 }, selector: 'switch-to-sub-process' },
      {
        type: nodeTypes.task,
        subType: nodeTypes.scriptTask,
        position: { x: 380, y: 300 },
        selector: 'switch-to-script-task',
      },
      {
        type: nodeTypes.task,
        subType: nodeTypes.manualTask,
        position: { x: 100, y: 400 },
        selector: 'switch-to-manual-task',
      },
    ];

    validBoundaryTimerEventTargets.forEach(({ type, position, selector }) => {
      if (selector) {
        addNodeTypeToPaper(position, nodeTypes.task, selector);
        return;
      }
      dragFromSourceToDest(type, position);
    });

    const numberOfElementsAfterAddingTasks = initialNumberOfElements + validBoundaryTimerEventTargets.length;
    getGraphElements().should('have.length', numberOfElementsAfterAddingTasks);

    validBoundaryTimerEventTargets.forEach(({ type, position, subType }) => {
      setBoundaryEvent(nodeTypes.boundaryTimerEvent, position, subType || type);

    });

    const numberOfElementsAfterAddingTasksAndBoundaryTimerEvents = initialNumberOfElements + validBoundaryTimerEventTargets.length * 2;
    getGraphElements().should('have.length', numberOfElementsAfterAddingTasksAndBoundaryTimerEvents);
  });

  it('can toggle interrupting on Boundary Timer Events', () => {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 260, y: 260 };
    setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);
    moveElement(taskPosition, boundaryTimerEventPosition.x, boundaryTimerEventPosition.y);

    const interrupting = '[name=cancelActivity]';
    cy.get(interrupting).should('be.checked');

    cy.get('[data-test=undo]').click({ force: true });
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click({ force: true });
    waitToRenderAllShapes();

    getElementAtPosition(boundaryTimerEventPosition, nodeTypes.boundaryTimerEvent).click();

    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({ force: true });
    cy.get(interrupting).should('not.be.checked');

  });

  it('can update the node identifier and this persists correctly', () => {
    uploadXml('taskWithBoundaryTimerEvent.xml');

    cy.get('.main-paper [data-type="processmaker.components.nodes.boundaryEvent.Shape"]')
      .click({ force: true });

    cy.contains('Advanced')
      .click({ force: true });

    const testId = 'test-id-update';
    cy.contains('Node Identifier')
      .next('input')
      .clear()
      .type(testId);

    assertDownloadedXmlContainsExpected(
      `<bpmn:boundaryEvent id="${testId}" name="Boundary Timer Event" attachedToRef="node_1">`,
      `<bpmndi:BPMNShape id="node_2_di" bpmnElement="${testId}">`,
    );
  });

  it('can toggle interrupting on Boundary Timer Events in multiple processes', () => {
    uploadXml('boundaryTimersInPools.xml');

    const boundaryTimerEventPositions = [{ x: 277, y: 162 }, { x: 225, y: 379 }];

    getElementAtPosition(boundaryTimerEventPositions[0], nodeTypes.boundaryTimerEvent).click();

    const interrupting = '[name=cancelActivity]';
    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({ force: true });
    cy.get(interrupting).should('not.be.checked');

    getElementAtPosition(boundaryTimerEventPositions[1], nodeTypes.boundaryTimerEvent).click({ force: true });

    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({ force: true });
    cy.get(interrupting).should('not.be.checked');
  });

  it('moves to another task when dragged over', () => {
    const taskPosition = { x: 300, y: 300 };
    const numberOfBoundaryTimerEventsAdded = 1;
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);

    const taskXml = '<bpmn:task id="node_2" name="Form Task" pm:assignment="requester" />';
    const boundaryEventOnTaskXml = '<bpmn:boundaryEvent id="node_3" name="Boundary Timer Event" attachedToRef="node_2">';

    assertDownloadedXmlContainsExpected(taskXml, boundaryEventOnTaskXml);

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
            const task2Xml = '<bpmn:task id="node_4" name="Form Task" pm:assignment="requester" />';
            const boundaryEventOnTask2Xml = '<bpmn:boundaryEvent id="node_3" name="Boundary Timer Event" attachedToRef="node_4">';

            assertDownloadedXmlContainsExpected(task2Xml, boundaryEventOnTask2Xml);
            assertDownloadedXmlDoesNotContainExpected(boundaryEventOnTaskXml);

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

  it('keeps Boundary Timer Event in correct position when dragging and dropping', () => {
    const taskPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);

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

            moveElement(task2Position, 300, 500, nodeTypes.task);
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

CommonBoundaryEventBehaviour({
  type: 'Boundary Timer Event',
  nodeType: nodeTypes.boundaryTimerEvent,
  eventXMLSnippet: '<bpmn:boundaryEvent id="node_3" name="Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>',
  taskType: nodeTypes.task,
  taskTypeSelector: 'switch-to-user-task',
  invalidTargets: [{ type: nodeTypes.startEvent }],
});
