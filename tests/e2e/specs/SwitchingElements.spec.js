import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getElementAtPosition,
  uploadXml,
  getLinksConnectedToElement, modalAnimationTime, modalConfirm, setBoundaryEvent, waitToRenderAllShapes,
} from '../support/utils';
import {nodeTypes} from '../support/constants';

function addFlowExpression(flowExpression, gatewayPosition) {
  getElementAtPosition(gatewayPosition)
    .then(getLinksConnectedToElement)
    .then($links => $links[0])
    .click({ force: true });

  cy.contains('Expression')
    .next('input')
    .clear()
    .type(flowExpression);
}

function changeGatewayTypeTo(newType, gatewayPosition) {
  getElementAtPosition(gatewayPosition).click();

  cy.get('[data-test=select-type-dropdown]').click();
  cy.get(`[data-test=switch-to-${newType}]`).click();
  modalConfirm();
  waitToRenderAllShapes();
}

function changeTypeTo(currentType, newType, position) {
  getElementAtPosition(position, currentType).click();
  cy.get('[data-test=select-type-dropdown]').click();
  cy.get(`[data-test=${newType}]`).click();

  cy.tick(modalAnimationTime);
  modalConfirm();
  cy.tick(modalAnimationTime);
}

describe('Switching elements', () => {
  it('Switching an exclusive gateway to a parallel gateway should remove conditions from flows', () => {
    const gatewayPosition = {x: 300, y: 150};
    const taskPosition = {x: 450, y: 150};
    dragFromSourceToDest(nodeTypes.exclusiveGateway, gatewayPosition);
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    connectNodesWithFlow('generic-flow-button', gatewayPosition, taskPosition);

    const flowExpression = '1234 == 1234';

    addFlowExpression(flowExpression, gatewayPosition);
    changeGatewayTypeTo('parallel-gateway', gatewayPosition);

    assertDownloadedXmlDoesNotContainExpected(flowExpression);
  });

  it('add a single undo state when replacing a node in place', () => {
    const ms = 300;
    cy.clock();
    const startEventPosition = { x: 150, y: 150 };
    const initialStartEvent = '<bpmn:startEvent id="node_1" name="Start Event" />';
    const replacementStartEvent = '<bpmn:startEvent id="node_2" name="Message Start Event">';
    assertDownloadedXmlContainsExpected(initialStartEvent);

    changeTypeTo(nodeTypes.startEvent, 'switch-to-message-start-event', startEventPosition);

    // if we see two nodes here the replacement failed completely
    assertDownloadedXmlContainsExpected(replacementStartEvent);
    assertDownloadedXmlDoesNotContainExpected(initialStartEvent);

    cy.get('[data-test=undo]').click();
    cy.tick(ms);
    // if we see two nodes here then we had an intermediate invalid undo state saved
    assertDownloadedXmlContainsExpected(initialStartEvent);
    assertDownloadedXmlDoesNotContainExpected(replacementStartEvent);
    cy.clock().invoke('restore');
  });

  it('deletes boundary events on tasks when the task type is switched', () => {
    cy.clock();

    const taskPosition = {x: 300, y: 150};
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-user-task');
    setBoundaryEvent(nodeTypes.boundaryMessageEvent, taskPosition, nodeTypes.task);
    changeTypeTo(nodeTypes.task, 'switch-to-manual-task', taskPosition);

    assertDownloadedXmlDoesNotContainExpected('<bpmn:boundaryEvent');
  });

  it('switch a saved user task to a script task', () => {
    uploadXml('processWithTwoTasks.xml');
    cy.get('[data-type="processmaker.components.nodes.task.Shape"]').eq(1).click();
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-script-task]').click();
    modalConfirm();
    waitToRenderAllShapes();
    cy.get('[data-test="validation-toggle"]').click({force: true});
    cy.get('.status-bar-container').should('contain.text', 'BPMN Valid');
  });
});
