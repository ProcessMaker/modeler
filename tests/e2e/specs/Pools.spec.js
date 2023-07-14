import {
  assertBoundaryEventIsCloseToTask,
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlContainsSubstringNTimes,
  assertDownloadedXmlDoesNotContainExpected,
  connectNodesWithFlow,
  clickAndDropElement,
  getCrownButtonForElement,
  getElementAtPosition,
  getPositionInPaperCoords,
  isElementCovered,
  moveElement,
  moveElementRelativeTo,
  removeIndentationAndLinebreaks,
  removeStartEvent,
  setBoundaryEvent,
  typeIntoTextInput,
  waitToRenderAllShapes,
  toggleInspector,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Pools', { scrollBehavior: false }, () => {
  it('Update pool name', () => {
    const testString = 'testing';

    const poolPosition = { x: 200, y: 200 };
    clickAndDropElement(nodeTypes.pool, poolPosition);
    waitToRenderAllShapes();
    getElementAtPosition(poolPosition, nodeTypes.pool).click();

    toggleInspector();
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Can add top and bottom lane', () => {
    const poolPosition = { x: 300, y: 300 };

    clickAndDropElement(nodeTypes.pool, poolPosition);
    waitToRenderAllShapes();

    getElementAtPosition(poolPosition, nodeTypes.pool)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-above-button').click({ force: true });
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });
  });

  it('Does not allow pool with only one lane', () => {
    const poolPosition = { x: 350, y: 300 };
    const lanePosition = { x: 300, y: 550 };

    clickAndDropElement(nodeTypes.pool, poolPosition);
    waitToRenderAllShapes();

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
    const startEventPosition = { x: 210, y: 200 };

    const pool1Position = { x: 200, y: 200 };
    clickAndDropElement(nodeTypes.pool, pool1Position);
    waitToRenderAllShapes();

    const startEventIn1stPool = '<bpmn:process id="Process_1" isExecutable="true"><bpmn:startEvent id="node_1" name="Start Event" /></bpmn:process>';
    const startEventIn1stPoolWithNullProps = '<bpmn:process id="Process_1" isExecutable="true"><bpmn:startEvent id="node_1" name="Start Event" /></bpmn:process>';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(startEventIn1stPool);
      });

    const pool2Position = { x: 300, y: 580 };
    clickAndDropElement(nodeTypes.pool, pool2Position);

    moveElement(startEventPosition, pool2Position);
    waitToRenderAllShapes();

    const empty1stPool = '<bpmn:process id="Process_1" isExecutable="true" />';
    const startEventIn2ndPool = '<bpmn:process id="Process_2"><bpmn:startEvent id="node_1" name="Start Event" /></bpmn:process>';
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
    const startEventPosition = { x: 210, y: 200 };
    const taskPosition = { x: 210, y: 350 };

    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    const poolPosition = { x: 300, y: 300 };
    clickAndDropElement(nodeTypes.pool, poolPosition);
    waitToRenderAllShapes();
    connectNodesWithFlow('generic-flow-button', startEventPosition, taskPosition);

    getElementAtPosition(poolPosition, nodeTypes.pool)
      .click({ force: true })
      .then($pool => {
        getCrownButtonForElement($pool, 'delete-button').click({ force: true });
      });

    const sequenceFlowReference = '<bpmn:sequenceFlow id="node_4" name="Sequence Flow" sourceRef="node_1" targetRef="node_2" />';

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
    clickAndDropElement(nodeTypes.pool, poolPosition);
    waitToRenderAllShapes();

    getElementAtPosition(poolPosition, nodeTypes.pool)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });

    const nonEmptyLane = '<bpmn:lane id="node_4" name=""><bpmn:flowNodeRef>node_1</bpmn:flowNodeRef></bpmn:lane>';
    assertDownloadedXmlContainsExpected(nonEmptyLane);

    const startEventPosition = { x: 210, y: 200 };
    getElementAtPosition(startEventPosition)
      .click()
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click();
      });

    const emptyLane = '<bpmn:lane id="node_4" name="" />';
    assertDownloadedXmlContainsExpected(emptyLane);
    assertDownloadedXmlDoesNotContainExpected('node_1');
  });

  it('Removes all references to element from a pool', () => {
    const poolPosition = { x: 300, y: 300 };
    clickAndDropElement(nodeTypes.pool, poolPosition);
    waitToRenderAllShapes();

    const startEventPosition = { x: 210, y: 200 };
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
    clickAndDropElement(nodeTypes.pool, poolPosition);

    const pool2Position = { x: 200, y: 550 };
    clickAndDropElement(nodeTypes.pool, pool2Position);

    const taskPosition = { x: 350, y: 200 };
    clickAndDropElement(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 260, y: 260 };
    setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);
    waitToRenderAllShapes();
    moveElement(taskPosition, boundaryTimerEventPosition.x, boundaryTimerEventPosition.y, nodeTypes.task);
    waitToRenderAllShapes();

    const pool1taskXml = `
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:startEvent id="node_1" name="Start Event" />
        <bpmn:task id="node_4" name="Form Task" pm:assignment="requester" />
        <bpmn:boundaryEvent id="node_13" name="Boundary Timer Event" attachedToRef="node_4">
    `;
    assertDownloadedXmlContainsExpected(pool1taskXml);

    cy.get('.paper-container').click('topLeft');
    waitToRenderAllShapes();

    moveElement(taskPosition, 300, 600, nodeTypes.task);

    const pool2taskXml = `
      <bpmn:process id="Process_2">
        <bpmn:task id="node_4" name="Form Task" pm:assignment="requester" />
        <bpmn:boundaryEvent id="node_13" name="Boundary Timer Event" attachedToRef="node_4">
    `;
    assertDownloadedXmlContainsExpected(pool2taskXml);
  });

  it('should revert pool element to initial position on undo after dragging outside of pool onto grid', () => {
    const poolPosition = { x: 300, y: 300 };
    clickAndDropElement(nodeTypes.pool, poolPosition);
    waitToRenderAllShapes();

    const startEventPosition = { x: 210, y: 200 };
    moveElementRelativeTo(startEventPosition, 600, 600, nodeTypes.startEvent);

    waitToRenderAllShapes();
    cy.get('[data-cy="undo-control"]').click();
    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition, nodeTypes.startEvent).should('exist');
  });

  it('should not cover child elements with lane', () => {
    const poolPosition = { x: 300, y: 300 };
    clickAndDropElement(nodeTypes.pool, poolPosition);
    waitToRenderAllShapes();

    getElementAtPosition(poolPosition, nodeTypes.pool)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-above-button').click({ force: true });
      });

    const startEventPosition = { x: 210, y: 200 };
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
    const taskPosition = { x: 300, y: 200 };
    clickAndDropElement(nodeTypes.task, taskPosition);
    setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);

    const poolPosition = { x: 300, y: 300 };
    clickAndDropElement(nodeTypes.pool, poolPosition);
    waitToRenderAllShapes();

    getElementAtPosition(poolPosition, nodeTypes.pool).then($pool => {
      assertBoundaryEventIsCloseToTask();

      cy.wrap($pool)
        .click()
        .trigger('mouseover')
        .trigger('mousedown', { which: 1, force: true })
        .trigger('mousemove', { clientX: 800, clientY: 350, force: true })
        .trigger('mousemove', { clientX: 800, clientY: 350, force: true })
        .trigger('mouseup', { force: true })
        .then(waitToRenderAllShapes)
        .then(assertBoundaryEventIsCloseToTask);
    });
  });

  it('Check LaneSet IDs', () => {
    const poolPosition1 = { x: 300, y: 150 };
    const poolPosition2 = { x: 300, y: 400 };

    // Add pool
    clickAndDropElement(nodeTypes.pool, poolPosition1);
    waitToRenderAllShapes();

    getElementAtPosition(poolPosition1, nodeTypes.pool).click().then($pool => {
      getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
    });

    clickAndDropElement(nodeTypes.pool, poolPosition2);

    getElementAtPosition({ x: 600, y: 600 }).click({ force: true }).then($pool => {
      getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
    });

    const laneSet1IdBpmn = `
      <bpmn:laneSet id="node_3">
        <bpmn:lane id="node_4" name="">
          <bpmn:flowNodeRef>node_1</bpmn:flowNodeRef>
        </bpmn:lane>
        <bpmn:lane id="node_5" name="" />
      </bpmn:laneSet>
    `;
    const laneSet2IdBpmn = `
      <bpmn:laneSet id="node_7">
        <bpmn:lane id="node_8" name="" />
        <bpmn:lane id="node_9" name="" />
      </bpmn:laneSet>
    `;
    assertDownloadedXmlContainsExpected(laneSet1IdBpmn);
    assertDownloadedXmlContainsExpected(laneSet2IdBpmn);
  });

  it('does not duplicate boundary events when added to a task in a pool', () => {
    const poolPosition1 = { x: 300, y: 150 };
    const poolPosition2 = { x: 300, y: 400 };
    const taskPosition = { x: 350, y: 450 };

    clickAndDropElement(nodeTypes.pool, poolPosition1);
    clickAndDropElement(nodeTypes.pool, poolPosition2);
    clickAndDropElement(nodeTypes.task, taskPosition);
    setBoundaryEvent(nodeTypes.boundaryConditionalEvent, taskPosition);

    assertDownloadedXmlContainsSubstringNTimes('<bpmn:boundaryEvent', 1);
  });

  describe('does not add flow node references to pool lanes for excluded items', () => {

    const poolPosition = {x: 200, y: 100};

    function addLaneBelow() {
      getElementAtPosition({x: poolPosition.x + 100, y: poolPosition.y + 100}, nodeTypes.pool)
        .click({force: true})
        .then($pool => {
          getCrownButtonForElement($pool, 'lane-below-button').click({force: true});
        });
    }

    function addElementsThatShouldNotHaveFlowNodeRefs() {
      clickAndDropElement(nodeTypes.dataStore, {x: poolPosition.x + 100, y: poolPosition.y + 100});
      clickAndDropElement(nodeTypes.dataObject, {x: poolPosition.x + 150, y: poolPosition.y + 150});
      clickAndDropElement(nodeTypes.textAnnotation, {x: poolPosition.x + 200, y: poolPosition.y + 200});
    }

    it('when adding elements to an existing lane', () => {
      removeStartEvent();
      clickAndDropElement(nodeTypes.pool, poolPosition);
      waitToRenderAllShapes();

      addLaneBelow();
      addElementsThatShouldNotHaveFlowNodeRefs();

      assertDownloadedXmlDoesNotContainExpected('<bpmn:flowNodeRef');
    });

    it('when adding elements to a pool and then adding a lane', () => {
      removeStartEvent();
      clickAndDropElement(nodeTypes.pool, poolPosition);
      waitToRenderAllShapes();

      addElementsThatShouldNotHaveFlowNodeRefs();
      waitToRenderAllShapes();
      addLaneBelow();

      assertDownloadedXmlDoesNotContainExpected('<bpmn:flowNodeRef');
    });

  });
});
