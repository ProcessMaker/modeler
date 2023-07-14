import {
  assertDownloadedXmlContainsExpected,
  connectNodesWithFlow,
  clickAndDropElement,
  getCrownButtonForElement,
  getElementAtPosition,
  getGraphElements,
  getLinksConnectedToElement,
  setBoundaryEvent,
  testNumberOfVertices,
  typeIntoTextInput,
  waitToRenderAllShapes,
  toggleInspector,
  moveElement,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

const TOOLBAR_HEIGHT = 64;

describe('Undo/redo', { scrollBehavior: false }, () => {
  const undoSelector = '[data-cy="undo-control"]';
  const redoSelector = '[data-cy="redo-control"]';

  beforeEach(() => {
    toggleInspector();
  });

  it('Can undo and redo sequence flow condition expression', () => {
    const exclusiveGatewayPosition = { x: 350, y: 250 + TOOLBAR_HEIGHT };
    clickAndDropElement(nodeTypes.exclusiveGateway, exclusiveGatewayPosition);

    const taskPosition = { x: 500, y: 500 };
    clickAndDropElement(nodeTypes.task, taskPosition);

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
    cy.get(undoSelector).click();

    waitToRenderAllShapes();

    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    cy.get(conditionExpressionSelector).should('have.value', defaultExpressionValue);

    cy.get(redoSelector).click();

    waitToRenderAllShapes();

    getElementAtPosition(exclusiveGatewayPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    cy.get(conditionExpressionSelector).should('have.value', testString);
  });

  it('Can undo and redo adding a task', () => {
    const taskPosition = { x: 300, y: 300 };

    clickAndDropElement(nodeTypes.task, taskPosition);

    cy.get(undoSelector).click();
    waitToRenderAllShapes();

    /* Only the start element should remain */
    getGraphElements().should('have.length', 1);

    cy.get(redoSelector).click();
    waitToRenderAllShapes();

    /* The task should now be re-added */
    getGraphElements().should('have.length', 2);
  });

  it('Can undo and redo deleting a task', () => {
    const taskPosition = { x: 300, y: 300 };

    clickAndDropElement(nodeTypes.task, taskPosition);

    getElementAtPosition(taskPosition)
      .click()
      .then($task => {
        getCrownButtonForElement($task, 'delete-button').click();
      });

    /* Only the start element should remain */
    getGraphElements().should('have.length', 1);

    cy.get(undoSelector).click();

    waitToRenderAllShapes();

    /* The task should now be re-added */
    getGraphElements().should('have.length', 2);
  });

  it('Can undo position changes', () => {
    const startEventPosition = { x: 210, y: 200 };
    const startEventMoveToPosition = { x: 350, y: 350 };

    cy.get(undoSelector)
      .click({ force: true })
      .should('be.disabled');

    waitToRenderAllShapes();

    cy.get(redoSelector)
      .click({ force: true })
      .should('be.disabled');

    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition)
      .then($startEvent => {
        moveElement($startEvent, startEventMoveToPosition.x, startEventMoveToPosition.y);
      })
      .should(position => {
        expect(position).to.not.deep.equal(startEventPosition);
      });

    waitToRenderAllShapes();

    cy.get(undoSelector)
      .should('not.be.disabled')
      .click({ force: true });

    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition).should('exist');
    getElementAtPosition(startEventMoveToPosition).should('not.exist');

    const taskPosition1 = { x: 250, y: 400 };
    const taskPosition2 = { x: taskPosition1.x + 200, y: taskPosition1.y };
    const taskPosition3 = { x: taskPosition2.x + 200, y: taskPosition2.y };
    clickAndDropElement(nodeTypes.task, taskPosition1);
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition1)
      .then($task => {
        moveElement($task, taskPosition2.x, taskPosition2.y);
        waitToRenderAllShapes();
        moveElement($task, taskPosition3.x, taskPosition3.y);
      });

    cy.get(undoSelector).click({ force: true });

    waitToRenderAllShapes();

    getElementAtPosition({ x: taskPosition2.x, y: taskPosition2.y + TOOLBAR_HEIGHT }).should('exist');
    getElementAtPosition(taskPosition3).should('not.exist');
  });

  it('Can undo and redo adding message flows', () => {
    const pool1Position = { x: 250, y: 250 };
    clickAndDropElement(nodeTypes.pool, pool1Position);

    const pool2Position = { x: 250, y: 500 };
    clickAndDropElement(nodeTypes.pool, pool2Position);

    connectNodesWithFlow('generic-flow-button', pool1Position, pool2Position, 'top');

    getGraphElements().then(elements => {
      const numberOfElements = elements.length;

      cy.get(undoSelector).click();
      waitToRenderAllShapes();
      getGraphElements().should('have.length', numberOfElements - 1);

      cy.get(redoSelector).click();
      waitToRenderAllShapes();
      getGraphElements().should('have.length', numberOfElements);
    });
  });

  it('Can update start event name after undo', () => {
    const startEventPosition = { x: 210, y: 200 };
    const testString = 'foo bar';

    getElementAtPosition(startEventPosition)
      .then($startEvent => {
        moveElement($startEvent, startEventPosition.x + 50, startEventPosition.y + 50);
        waitToRenderAllShapes();
      });
    cy.get(undoSelector).click();
    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition).click();
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Can update two properties at the same time', () => {
    const newName = 'foobar';
    const newId = 'node_1234';
    getElementAtPosition({ x: 210, y: 200 }).click();
    cy.get('[name=name]').clear().type(newName).should('have.value', newName);
    cy.contains('Advanced').click();
    cy.get('[name=id] input').clear().type(newId).should('have.value', newId);
  });

  it('Correctly parses elements after redo', () => {
    waitToRenderAllShapes();

    const testConnectorPosition = { x: 350, y: 300 };
    clickAndDropElement(nodeTypes.testConnector, testConnectorPosition);

    const sendTweetPosition = { x: 350, y: 450 };
    clickAndDropElement(nodeTypes.sendTweet, sendTweetPosition);

    const testConnector = '<bpmn:serviceTask id="node_2" name="Test Connector" pm:config="{&#34;testMessage&#34;:&#34;&#34;}" implementation="test-message" />';
    const sendTweet = '<bpmn:serviceTask id="node_5" name="Send Tweet" pm:config="{&#34;tweet&#34;:&#34;&#34;}" implementation="processmaker-social-twitter-send" />';

    assertDownloadedXmlContainsExpected(testConnector, sendTweet);

    cy.get(undoSelector).click();
    waitToRenderAllShapes();
    cy.get(undoSelector).click({ force: true });
    waitToRenderAllShapes();
    cy.get(redoSelector).click();
    waitToRenderAllShapes();
    cy.get(redoSelector).click({ force: true });
    waitToRenderAllShapes();

    assertDownloadedXmlContainsExpected(testConnector, sendTweet);
  });

  it('Can undo/redo modifying sequence flow vertices', () => {
    const startEventPosition = { x: 210, y: 200 };
    const taskPosition = { x: 300, y: 300 };

    clickAndDropElement(nodeTypes.task, taskPosition);
    connectNodesWithFlow('generic-flow-button', startEventPosition, taskPosition);

    const initialNumberOfWaypoints = 4;
    testNumberOfVertices(initialNumberOfWaypoints);

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click('topRight', { force: true });

    waitToRenderAllShapes();

    cy.get('[data-tool-name=vertices]').trigger('mousedown', 'topRight');
    waitToRenderAllShapes();
    cy.get('[data-tool-name=vertices]').trigger('mousemove', 'bottomLeft', { force: true });
    waitToRenderAllShapes();
    cy.get('[data-tool-name=vertices]').trigger('mouseup', 'bottomLeft', { force: true });
    waitToRenderAllShapes();

    const updatedNumberOfWaypoints = 8;
    testNumberOfVertices(updatedNumberOfWaypoints);

    cy.get(undoSelector).click({ force: true });

    waitToRenderAllShapes();

    testNumberOfVertices(initialNumberOfWaypoints);
  });

  it('Can undo/redo modifying association flow vertices', () => {
    const startEventPosition = { x: 210, y: 200 };
    const textAnnotationPosition = { x: 300, y: 300 };
    clickAndDropElement(nodeTypes.textAnnotation, textAnnotationPosition);
    waitToRenderAllShapes();
    connectNodesWithFlow('association-flow-button', textAnnotationPosition, startEventPosition);

    const initialNumberOfWaypoints = 2;
    testNumberOfVertices(initialNumberOfWaypoints);

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click();

    waitToRenderAllShapes();

    cy.get('[data-tool-name=vertices]').trigger('mousedown');
    waitToRenderAllShapes();
    cy.get('[data-tool-name=vertices]').trigger('mousemove', 'bottomLeft', { force: true });
    waitToRenderAllShapes();
    cy.get('[data-tool-name=vertices]').trigger('mouseup', 'bottomLeft', { force: true });
    waitToRenderAllShapes();

    const updatedNumberOfWaypoints = 3;
    testNumberOfVertices(updatedNumberOfWaypoints);

    cy.get(undoSelector).click({ force: true });

    waitToRenderAllShapes();

    testNumberOfVertices(initialNumberOfWaypoints);
  });

  it('undo/redo boundary timer event', () => {
    const taskPosition = { x: 350, y: 200 };
    clickAndDropElement(nodeTypes.task, taskPosition);

    setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);

    const initialNumberOfElements = 3;
    const numberOfElementsToRemove = 1;

    getGraphElements().should('have.length', initialNumberOfElements);

    cy.get(undoSelector).click({ force: true });
    waitToRenderAllShapes();

    getGraphElements().should('have.length', initialNumberOfElements - numberOfElementsToRemove);

    cy.get(redoSelector).click({ force: true });
    waitToRenderAllShapes();

    getGraphElements().should('have.length', initialNumberOfElements);
  });
});
