import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getCrownButtonForElement,
  getElementAtPosition,
  getLinksConnectedToElement,
  getNumberOfLinks,
  isElementCovered,
  modalConfirm,
  moveElement,
  removeStartEvent,
  setBoundaryEvent,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Message Flows', () => {
  it('Can connect two pools with a message flow', () => {
    const pool1Position = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.pool, pool1Position);

    const pool2Position = { x: 250, y: 500 };
    dragFromSourceToDest(nodeTypes.pool, pool2Position);

    connectNodesWithFlow('generic-flow-button', pool1Position, pool2Position, 'top');

    moveElement(pool1Position, 300, 300);
    moveElement(pool1Position, 250, 250);

    const numberOfMessageFlowsAdded = 1;
    getElementAtPosition(pool2Position)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links.length).to.eq(numberOfMessageFlowsAdded);
      });
  });

  it('Can connect elements in pools with a message flow', () => {
    const pool1Position = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.pool, pool1Position);

    const pool2Position = { x: 250, y: 500 };
    dragFromSourceToDest(nodeTypes.pool, pool2Position);

    const offset = 100;
    const taskPosition = { x: pool2Position.x + offset, y: pool2Position.y + offset };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const startEventPosition = { x: 150, y: 150 };
    getElementAtPosition(startEventPosition, nodeTypes.startEvent)
      .click()
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click();
      });
    addNodeTypeToPaper(startEventPosition, nodeTypes.startEvent, 'switch-to-message-start-event');

    connectNodesWithFlow('generic-flow-button', taskPosition, startEventPosition);

    const numberOfMessageFlowsAdded = 1;
    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links.length).to.eq(numberOfMessageFlowsAdded);
      });
  });

  it('Can connect pool to a task in a different pool', () => {
    const pool1Position = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.pool, pool1Position);

    const pool2Position = { x: 250, y: 500 };
    dragFromSourceToDest(nodeTypes.pool, pool2Position);

    const offset = 100;
    const taskPosition = { x: pool2Position.x + offset, y: pool2Position.y + offset };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('generic-flow-button', pool1Position, taskPosition);

    const numberOfMessageFlowsAdded = 1;
    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links.length).to.eq(numberOfMessageFlowsAdded);
      });
  });

  it('Cannot connect to itself', () => {
    const startEventPosition = { x: 150, y: 150 };
    removeStartEvent();
    addNodeTypeToPaper(startEventPosition, nodeTypes.endEvent, 'switch-to-message-end-event');

    const poolPosition = { x: 100, y: 400 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const taskPosition = {x: 250, y: 250};
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    cy.get('[data-test=switch-to-user-task').click();

    getElementAtPosition(poolPosition, nodeTypes.pool)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });

    getNumberOfLinks().should('equal', 0);

    [poolPosition, startEventPosition, taskPosition].forEach(position => {
      connectNodesWithFlow('generic-flow-button', position, position);
    });

    getNumberOfLinks().should('equal', 0);
  });

  it('Cannot connect to invalid message flow targets', () => {
    const endEventPosition = { x: 150, y: 150 };
    removeStartEvent();
    addNodeTypeToPaper(endEventPosition, nodeTypes.endEvent, 'switch-to-message-end-event');

    const poolPosition = { x: 100, y: 250 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const offset = 100;
    const taskPosition = { x: poolPosition.x + offset, y: poolPosition.y + offset };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    cy.get('[data-test=switch-to-user-task').click();

    getElementAtPosition(poolPosition, nodeTypes.pool)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });

    const poolHeight = 300;
    const poolLanePosition = { x: poolPosition.x + 100, y: poolPosition.y + poolHeight };

    getNumberOfLinks().should('equal', 0);

    connectNodesWithFlow('generic-flow-button', poolPosition, endEventPosition);
    connectNodesWithFlow('generic-flow-button', poolPosition, taskPosition);
    connectNodesWithFlow('generic-flow-button', poolPosition, poolLanePosition);

    connectNodesWithFlow('generic-flow-button', endEventPosition, poolPosition);
    connectNodesWithFlow('generic-flow-button', endEventPosition, poolLanePosition);

    connectNodesWithFlow('generic-flow-button', taskPosition, poolPosition);
    connectNodesWithFlow('generic-flow-button', taskPosition, poolLanePosition);

    getNumberOfLinks().should('equal', 0);
  });

  it('Adding a pool and lanes does not overlap message flow', () => {
    const poolPosition = { x: 150, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const poolTwoPosition = { x: 150, y: 600 };
    dragFromSourceToDest(nodeTypes.pool, poolTwoPosition);

    const taskPosition = { x: 200, y: 600 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const startEventPosition = { x: 150, y: 150 };
    getElementAtPosition(startEventPosition, nodeTypes.startEvent)
      .click()
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click();
      });
    addNodeTypeToPaper(startEventPosition, nodeTypes.startEvent, 'switch-to-message-start-event');
    connectNodesWithFlow('generic-flow-button', taskPosition, startEventPosition);

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .then(isElementCovered).should(isCovered => expect(isCovered).to.be.false);


    getElementAtPosition(poolTwoPosition)
      .click({ force: true })
      .then($pool => getCrownButtonForElement($pool, 'lane-above-button')).click({ force: true });

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .then(isElementCovered).should(isCovered => expect(isCovered).to.be.false);
  });

  it('Retains message flows when switching task type', () => {
    const startEventPosition = { x: 150, y: 150 };
    const pool1Position = { x: 250, y: 250 };
    const pool2Position = { x: 250, y: 500 };
    const offset = 100;
    const taskPosition = { x: pool2Position.x + offset, y: pool2Position.y + offset };
    let numberOfMessageFlowsAdded = 1;

    removeStartEvent();
    addNodeTypeToPaper(startEventPosition, nodeTypes.endEvent, 'switch-to-message-end-event');

    dragFromSourceToDest(nodeTypes.pool, pool1Position);
    dragFromSourceToDest(nodeTypes.pool, pool2Position);
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('generic-flow-button', startEventPosition, taskPosition);

    getElementAtPosition(taskPosition).then(getLinksConnectedToElement).should($links => {
      expect($links.length).to.eq(numberOfMessageFlowsAdded);
    });

    const messageFlow = 'bpmn:messageFlow';
    assertDownloadedXmlContainsExpected(messageFlow);

    waitToRenderAllShapes();

    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    modalConfirm();

    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).then(getLinksConnectedToElement).should($links => {
      expect($links.length).to.eq(numberOfMessageFlowsAdded);
    });

    assertDownloadedXmlContainsExpected(messageFlow);
  });

  it('should connect message end event to boundary message event in different pools', () => {
    const startEventPosition = { x: 150, y: 150 };
    const pool1Position = { x: 250, y: 250 };
    const pool2Position = { x: 250, y: 500 };
    const offset = 100;
    const taskPosition = { x: pool2Position.x + offset, y: pool2Position.y + offset };
    const boundaryEventPosition = { x: taskPosition.x + 58, y: taskPosition.y };

    removeStartEvent();
    addNodeTypeToPaper(startEventPosition, nodeTypes.endEvent, 'switch-to-message-end-event');

    dragFromSourceToDest(nodeTypes.pool, pool1Position);
    dragFromSourceToDest(nodeTypes.pool, pool2Position);
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');
    setBoundaryEvent(nodeTypes.boundaryMessageEvent, taskPosition, nodeTypes.subProcess);
    connectNodesWithFlow('generic-flow-button', startEventPosition, boundaryEventPosition, 'center');

    const endEventId = 'node_3';
    const boundaryEventId = 'node_8';
    const endEventXml = `<bpmn:endEvent id="${endEventId}" name="Message End Event">`;
    const boundaryEventXml = `<bpmn:boundaryEvent id="${boundaryEventId}" name="Boundary Message Event" attachedToRef="node_7">`;
    const messageFlowXml = `<bpmn:messageFlow id="node_10" name="" sourceRef="${endEventId}" targetRef="${boundaryEventId}" />`;

    assertDownloadedXmlContainsExpected(endEventXml, boundaryEventXml, messageFlowXml);
  });
});
