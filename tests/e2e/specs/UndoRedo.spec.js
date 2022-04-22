import {
  assertDownloadedXmlContainsExpected,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getCrownButtonForElement,
  getElementAtPosition,
  getGraphElements,
  getLinksConnectedToElement,
  setBoundaryEvent,
  testNumberOfVertices,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

const TOOLBAR_HEIGHT = 64;

describe('Undo/redo', () => {
  it('Can undo and redo sequence flow condition expression', () => {
    const exclusiveGatewayPosition = { x: 250, y: 250 + TOOLBAR_HEIGHT };
    dragFromSourceToDest(nodeTypes.exclusiveGateway, exclusiveGatewayPosition);

    const taskPosition = { x: 400, y: 500 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('generic-flow-button', exclusiveGatewayPosition, taskPosition);

    getElementAtPosition(exclusiveGatewayPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    const defaultExpressionValue = '';
    const testString = 'foo > 7';

    const conditionExpressionSelector = '[name=conditionExpression]';
    cy.get(conditionExpressionSelector).should('have.value', defaultExpressionValue);
    typeIntoTextInput(conditionExpressionSelector, testString);
    cy.get(conditionExpressionSelector).should('have.value', testString);

    cy.get('.paper-container').click({ force: true });
    cy.get('[data-test=undo]').click();

    waitToRenderAllShapes();

    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    cy.get(conditionExpressionSelector).should('have.value', defaultExpressionValue);

    cy.get('[data-test=redo]').click();

    waitToRenderAllShapes();

    getElementAtPosition(exclusiveGatewayPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    cy.get(conditionExpressionSelector).should('have.value', testString);
  });

  it('Can undo and redo adding a task', () => {
    const taskPosition = { x: 300, y: 300 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();

    /* Only the start element should remain */
    getGraphElements().should('have.length', 1);

    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    /* The task should now be re-added */
    getGraphElements().should('have.length', 2);
  });

  it('Can undo and redo deleting a task', () => {
    const taskPosition = { x: 300, y: 300 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    getElementAtPosition(taskPosition)
      .click()
      .then($task => {
        getCrownButtonForElement($task, 'delete-button').click();
      });

    /* Only the start element should remain */
    getGraphElements().should('have.length', 1);

    cy.get('[data-test=undo]').click();

    waitToRenderAllShapes();

    /* The task should now be re-added */
    getGraphElements().should('have.length', 2);
  });

  it('Can undo position changes', () => {
    const startEventPosition = { x: 150, y: 150 };
    const startEventMoveToPosition = { x: 300, y: 300 };

    cy.get('[data-test=undo]')
      .click({ force: true })
      .should('be.disabled');

    waitToRenderAllShapes();

    cy.get('[data-test=redo]')
      .click({ force: true })
      .should('be.disabled');

    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition)
      .moveTo(startEventMoveToPosition.x, startEventMoveToPosition.y)
      .should(position => {
        expect(position).to.not.deep.equal(startEventPosition);
      });

    cy.get('[data-test=undo]')
      .should('not.be.disabled')
      .click({ force: true });

    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition).should('exist');
    getElementAtPosition(startEventMoveToPosition).should('not.exist');

    const taskPosition1 = { x: 150, y: 400 };
    const taskPosition2 = { x: taskPosition1.x + 200, y: taskPosition1.y };
    const taskPosition3 = { x: taskPosition2.x + 200, y: taskPosition2.y };
    dragFromSourceToDest(nodeTypes.task, taskPosition1);

    getElementAtPosition(taskPosition1)
      .moveTo(taskPosition2.x, taskPosition2.y)
      .moveTo(taskPosition3.x, taskPosition3.y);

    cy.get('[data-test=undo]').click({ force: true });

    waitToRenderAllShapes();

    getElementAtPosition({ x: taskPosition2.x, y: taskPosition2.y + TOOLBAR_HEIGHT }).should('exist');
    getElementAtPosition(taskPosition3).should('not.exist');
  });

  it('Can undo and redo adding message flows', () => {
    const pool1Position = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.pool, pool1Position);

    const pool2Position = { x: 250, y: 500 };
    dragFromSourceToDest(nodeTypes.pool, pool2Position);

    connectNodesWithFlow('generic-flow-button', pool1Position, pool2Position, 'top');

    getGraphElements().then(elements => {
      const numberOfElements = elements.length;

      cy.get('[data-test=undo]').click();
      waitToRenderAllShapes();
      getGraphElements().should('have.length', numberOfElements - 1);

      cy.get('[data-test=redo]').click();
      waitToRenderAllShapes();
      getGraphElements().should('have.length', numberOfElements);
    });
  });

  it('Can update start event name after undo', () => {
    const startEventPosition = { x: 150, y: 150 };
    const testString = 'foo bar';

    getElementAtPosition(startEventPosition)
      .moveTo(startEventPosition.x + 50, startEventPosition.y + 50);
    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition).click();
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Can update two properties at the same time', () => {
    const newName = 'foobar';
    const newId = 'node_1234';
    getElementAtPosition({ x: 150, y: 150 }).click();
    cy.get('[name=name]').clear().type(newName).should('have.value', newName);
    cy.contains('Advanced').click();
    cy.get('[name=id] input').clear().type(newId).should('have.value', newId);
  });

  it('Correctly parses elements after redo', () => {
    waitToRenderAllShapes();

    const testConnectorPosition = { x: 150, y: 300 };
    dragFromSourceToDest(nodeTypes.testConnector, testConnectorPosition);

    const sendTweetPosition = { x: 150, y: 450 };
    dragFromSourceToDest(nodeTypes.sendTweet, sendTweetPosition);

    const testConnector = '<bpmn:serviceTask id="node_2" name="Test Connector" pm:config="{&#34;testMessage&#34;:&#34;&#34;}" implementation="test-message" />';
    const sendTweet = '<bpmn:serviceTask id="node_3" name="Send Tweet" pm:config="{&#34;tweet&#34;:&#34;&#34;}" implementation="processmaker-social-twitter-send" />';

    assertDownloadedXmlContainsExpected(testConnector, sendTweet);

    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();
    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    assertDownloadedXmlContainsExpected(testConnector, sendTweet);
  });

  it('Can undo/redo modifying sequence flow vertices', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 300, y: 300 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);
    connectNodesWithFlow('generic-flow-button', startEventPosition, taskPosition);

    const initialNumberOfWaypoints = 4;
    testNumberOfVertices(initialNumberOfWaypoints);

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click('topRight', { force: true });

    waitToRenderAllShapes();

    cy.get('[data-tool-name=vertices]').trigger('mousedown', 'topRight');
    cy.get('[data-tool-name=vertices]').trigger('mousemove', 'bottomLeft', { force: true });
    cy.get('[data-tool-name=vertices]').trigger('mouseup', 'bottomLeft', { force: true });

    waitToRenderAllShapes();

    const updatedNumberOfWaypoints = 8;
    testNumberOfVertices(updatedNumberOfWaypoints);

    cy.get('[data-test=undo]').click({ force: true });

    waitToRenderAllShapes();

    testNumberOfVertices(initialNumberOfWaypoints);
  });

  it('Can undo/redo modifying association flow vertices', () => {
    const startEventPosition = { x: 150, y: 150 };
    const textAnnotationPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.textAnnotation, textAnnotationPosition);
    connectNodesWithFlow('association-flow-button', textAnnotationPosition, startEventPosition);

    const initialNumberOfWaypoints = 2;
    testNumberOfVertices(initialNumberOfWaypoints);

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click();

    waitToRenderAllShapes();

    cy.get('[data-tool-name=vertices]').trigger('mousedown');
    cy.get('[data-tool-name=vertices]').trigger('mousemove', 'bottomLeft', { force: true });
    cy.get('[data-tool-name=vertices]').trigger('mouseup', 'bottomLeft', { force: true });

    waitToRenderAllShapes();

    const updatedNumberOfWaypoints = 3;
    testNumberOfVertices(updatedNumberOfWaypoints);

    cy.get('[data-test=undo]').click({ force: true });

    waitToRenderAllShapes();

    testNumberOfVertices(initialNumberOfWaypoints);
  });

  it('undo/redo boundary timer event', () => {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);

    const initialNumberOfElements = 3;
    const numberOfElementsToRemove = 1;

    getGraphElements().should('have.length', initialNumberOfElements);

    cy.get('[data-test=undo]').click({ force: true });
    waitToRenderAllShapes();

    getGraphElements().should('have.length', initialNumberOfElements - numberOfElementsToRemove);

    cy.get('[data-test=redo]').click({ force: true });
    waitToRenderAllShapes();

    getGraphElements().should('have.length', initialNumberOfElements);
  });
});
