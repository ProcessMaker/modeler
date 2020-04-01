import {
  assertBoundaryEventIsCloseToTask,
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getCrownButtonForElement,
  getElementAtPosition,
  getPositionInPaperCoords,
  isElementCovered,
  moveElement,
  moveElementRelativeTo,
  removeIndentationAndLinebreaks,
  setBoundaryEvent,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Pools', () => {
  it('Update pool name', () => {
    const testString = 'testing';

    const poolPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Can add top and bottom lane', () => {
    const poolPosition = { x: 300, y: 300 };

    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-above-button').click({ force: true });
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });
  });

  it('Does not allow pool with only one lane', () => {
    const poolPosition = { x: 300, y: 300 };
    const lanePosition = { x: 300, y: 550 };

    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition).click().then($pool => {
      getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
    });

    getElementAtPosition(poolPosition).click().then($pool => {
      getCrownButtonForElement($pool, 'delete-button').click({ force: true });
    });

    getElementAtPosition(lanePosition).getType().should('not.equal', nodeTypes.lane);
    getElementAtPosition(lanePosition).getType().should('equal', nodeTypes.pool);
  });

  it('Can drag elements between pools', () => {
    const startEventPosition = { x: 150, y: 150 };

    const pool1Position = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.pool, pool1Position);

    const startEventIn1stPool = '<bpmn:process id="Process_1" isExecutable="true"><bpmn:startEvent id="node_1" name="Start Event" /></bpmn:process>';
    const startEventIn1stPoolWithNullProps = '<bpmn:process id="Process_1" isExecutable="true"><bpmn:startEvent id="node_1" name="Start Event" /></bpmn:process>';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(startEventIn1stPool);
      });

    const pool2Position = { x: 200, y: 500 };
    dragFromSourceToDest(nodeTypes.pool, pool2Position);

    moveElement(startEventPosition, pool2Position);
    waitToRenderAllShapes();

    const empty1stPool = '<bpmn:process id="Process_1" isExecutable="true" />';
    const startEventIn2ndPool = '<bpmn:process id="process_2"><bpmn:startEvent id="node_1" name="Start Event" /></bpmn:process>';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(empty1stPool);
        expect(xml).to.contain(startEventIn2ndPool);
      });

    moveElement(pool2Position, startEventPosition);
    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition).click();

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(startEventIn1stPoolWithNullProps);
      });

    waitToRenderAllShapes();
  });

  it('remove all references of flows when deleting a pool with a process', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 350, y: 350 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const poolPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);
    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'delete-button').click({ force: true });
      });

    const sequenceFlowReference = '<bpmn:sequenceFlow id="node_3" name="Sequence Flow" sourceRef="node_1" targetRef="node_2" />';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.not.contain(sequenceFlowReference);
      });
  });

  it('Removes all references to element from lane', () => {
    const poolPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });

    const nonEmptyLane = '<bpmn:lane id="node_3" name=""><bpmn:flowNodeRef>node_1</bpmn:flowNodeRef></bpmn:lane>';
    assertDownloadedXmlContainsExpected(nonEmptyLane);

    const startEventPosition = { x: 150, y: 150 };
    getElementAtPosition(startEventPosition)
      .click()
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click();
      });

    const emptyLane = '<bpmn:lane id="node_3" name="" />';
    assertDownloadedXmlContainsExpected(emptyLane);
    assertDownloadedXmlDoesNotContainExpected('node_1');
  });

  it('Removes all references to element from a pool', () => {
    const poolPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const startEventPosition = { x: 150, y: 150 };
    getElementAtPosition(startEventPosition).click().then($startEvent => {
      getCrownButtonForElement($startEvent, 'delete-button').click();
    });

    const startEvent = '<bpmn:startEvent id="node_1" name="Start Event" />';
    const emptyPool = '<bpmn:participant id="node_2" name="Pool" processRef="Process_1" />';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window().its('xml').then(removeIndentationAndLinebreaks).then(xml => {
      expect(xml).to.contain(emptyPool);
      expect(xml).to.not.contain(startEvent);
    });
  });

  it('moves boundary event to another process when dragged to that pool', () => {
    const poolPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const pool2Position = { x: 100, y: 500 };
    dragFromSourceToDest(nodeTypes.pool, pool2Position);

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 260, y: 260 };
    setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);
    moveElement(taskPosition, boundaryTimerEventPosition.x, boundaryTimerEventPosition.y);

    const pool1taskXml = `
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:startEvent id="node_1" name="Start Event" />
        <bpmn:task id="node_4" name="Form Task" pm:assignment="requester" />
        <bpmn:boundaryEvent id="node_5" name="Boundary Timer Event" attachedToRef="node_4">
    `;
    assertDownloadedXmlContainsExpected(pool1taskXml);

    moveElement(taskPosition, 150, 550);

    const pool2taskXml = `
      <bpmn:process id="process_2">
        <bpmn:task id="node_4" name="Form Task" pm:assignment="requester" />
        <bpmn:boundaryEvent id="node_5" name="Boundary Timer Event" attachedToRef="node_4">
    `;
    assertDownloadedXmlContainsExpected(pool2taskXml);
  });

  it('should revert pool element to initial position on undo after dragging outside of pool onto grid', () => {
    const poolPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const startEventPosition = { x: 150, y: 150 };
    moveElementRelativeTo(startEventPosition, 600, 600, nodeTypes.startEvent);

    waitToRenderAllShapes();
    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition, nodeTypes.startEvent).should('exist');
  });

  it('should not cover child elements with lane', () => {
    const poolPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition, nodeTypes.pool)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-above-button').click({ force: true });
      });

    const startEventPosition = { x: 150, y: 150 };
    const topLanePosition = { x: startEventPosition.x, y: startEventPosition.y - 50 };
    getPositionInPaperCoords(startEventPosition).then(({ x, y }) => {
      getElementAtPosition(topLanePosition, nodeTypes.poolLane).click();

      cy.get('.main-paper [button-id="bottom-right-resize-button"]')
        .trigger('mousedown')
        .trigger('mousemove', { clientX: x, clientY: y + 100, force: true })
        .trigger('mouseup');
    });

    getElementAtPosition(startEventPosition, nodeTypes.startEvent)
      .then(isElementCovered).should(isCovered => expect(isCovered).to.be.false);
  });

  it('does not move boundary events independently from tasks when moving pool', () => {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);

    const poolPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition).then($pool => {
      assertBoundaryEventIsCloseToTask();

      cy.wrap($pool)
        .trigger('mousedown', { which: 1, force: true })
        .trigger('mousemove', { clientX: 800, clientY: 350, force: true })
        .trigger('mouseup', { force: true })
        .then(waitToRenderAllShapes)
        .then(assertBoundaryEventIsCloseToTask);
    });
  });
});
