import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getElementAtPosition,
  getLinksConnectedToElement,
  modalConfirm,
  moveElement,
  removeIndentationAndLinebreaks,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';
import { taskWidth } from '../../../src/components/nodes/task/taskConfig';
import { startEventDiameter } from '../../../src/components/nodes/startEvent/startEventConfig';
import { endColor, startColor } from '../../../src/components/nodeColors';

describe('Sequence Flows', () => {
  it('Can connect two elements', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 250, y: 250 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    const numberOfSequenceFlowsAdded = 1;

    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links.length).to.eq(numberOfSequenceFlowsAdded);
      });
  });

  it('Update name and condition expression', () => {
    const exclusiveGatewayPosition = { x: 400, y: 300 };
    dragFromSourceToDest(nodeTypes.exclusiveGateway, exclusiveGatewayPosition);

    const taskPosition = { x: 400, y: 500 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', exclusiveGatewayPosition, taskPosition);

    getElementAtPosition(exclusiveGatewayPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    const testNameString = 'Sequence name test';
    typeIntoTextInput('[name=name]', testNameString);
    cy.get('[name=name]').should('have.value', testNameString);

    const testExpressionString = 'foo == 7';
    typeIntoTextInput('[name=conditionExpression]', testExpressionString);
    cy.get('[name=conditionExpression]').should('have.value', testExpressionString);

    const sequenceFlowXml = `<bpmn:sequenceFlow id="node_4" name="${testNameString}" sourceRef="node_2" targetRef="node_3"><bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${testExpressionString}</bpmn:conditionExpression></bpmn:sequenceFlow>`;

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(sequenceFlowXml);
      });
  });

  /**
   * Skipping temporarily due to problems with the new toolbar position.
   * Cypress is having issues with this toolbar as it centres the page on selected elements.
   * This is making the toolbar disappear and reappear, which is making it hard to measure the location of anything.
   */
  it.skip('Allows modifying anchor points', () => {
    const taskPosition = { x: 200, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const task2Position = { x: 400, y: 500 };
    dragFromSourceToDest(nodeTypes.task, task2Position);

    connectNodesWithFlow('sequence-flow-button', taskPosition, task2Position);

    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click('topRight');

    cy.get('[data-tool-name=target-anchor]').should('be.visible');
    cy.get('[data-tool-name=source-anchor]').should('be.visible');

    const checkAnchorPoints = endpoint => {
      const anchorSelector = `[data-tool-name=${endpoint}-anchor]`;

      cy.get(anchorSelector).then($anchor => {
        const { top, left } = $anchor.position();

        /* Move anchor to left */
        cy.get(anchorSelector).trigger('mousedown');
        cy.get(anchorSelector).trigger('mousemove', -100, 1, { force: true });
        cy.get(anchorSelector).trigger('mouseup', { force: true });
        cy.get(anchorSelector).should(() => {
          const { left: newLeft } = $anchor.position();
          expect(newLeft).to.be.lessThan(left);
        });

        /* Move anchor to right */
        cy.get(anchorSelector).trigger('mousedown');
        cy.get(anchorSelector).trigger('mousemove', 200, 1, { force: true });
        cy.get(anchorSelector).trigger('mouseup', { force: true });
        cy.get(anchorSelector).should(() => {
          const { left: newLeft } = $anchor.position();
          expect(newLeft).to.be.greaterThan(left);
        });

        /* Move anchor to bottom */
        cy.get(anchorSelector).trigger('mousedown');
        cy.get(anchorSelector).trigger('mousemove', 1, 200, { force: true });
        cy.get(anchorSelector).trigger('mouseup', { force: true });
        cy.get(anchorSelector).should(() => {
          const { top: newTop } = $anchor.position();
          expect(newTop).to.be.greaterThan(top);
        });

        /* Move anchor to top */
        cy.get(anchorSelector).trigger('mousedown');
        cy.get(anchorSelector).trigger('mousemove', 1, -200, { force: true });
        cy.get(anchorSelector).trigger('mouseup', { force: true });
        cy.get(anchorSelector).should(() => {
          const { top: newTop } = $anchor.position();
          expect(newTop).to.be.lessThan(top);
        });

        /* Move anchor back to center */
        cy.get(anchorSelector).trigger('mousedown');
        cy.get(anchorSelector).trigger('mousemove', 0, 0, { force: true });
        cy.get(anchorSelector).trigger('mouseup', { force: true });
        cy.get(anchorSelector).should(() => {
          const { left: newLeft, top: newTop } = $anchor.position();
          expect(newLeft).to.be.closeTo(left, 1);
          expect(newTop).to.be.closeTo(top, 1);
        });
      });
    };
    checkAnchorPoints('source');
    checkAnchorPoints('target');
  });

  it('Retains target anchor point after parsing and moving shape', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 200, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click('topRight', { force: true });

    waitToRenderAllShapes();

    const anchorSelector = '[data-tool-name=target-anchor]';

    cy.get(anchorSelector).then(() => {
      /* Move anchor to right */
      cy.get(anchorSelector).trigger('mousedown');
      cy.get(anchorSelector).trigger('mousemove', 200, 1, { force: true });
      cy.get(anchorSelector).trigger('mouseup', { force: true });
    });

    moveElement(taskPosition, taskPosition.y + 50, taskPosition.y);

    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();

    const newTaskPosition = { x: taskPosition.x + 300, y: taskPosition.y };
    moveElement(taskPosition, newTaskPosition.x, newTaskPosition.y);

    getElementAtPosition(newTaskPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click('topRight', { force: true });

    cy.get(anchorSelector).then($anchor => {
      /* Anchor should still be on the right */
      const { left } = $anchor.position();

      getElementAtPosition(newTaskPosition).then($task => {
        const { left: taskleft } = $task.position();

        expect(left).to.be.greaterThan(taskleft);
      });
    });
  });

  it('Retains source anchor point after parsing and moving shape', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 400, y: 400 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click('topRight', { force: true });

    waitToRenderAllShapes();

    const anchorSelector = '[data-tool-name=source-anchor]';

    cy.get(anchorSelector).then(() => {
      /* Move anchor to bottom */
      cy.get(anchorSelector).trigger('mousedown');
      cy.get(anchorSelector).trigger('mousemove', 1, 200, { force: true });
      cy.get(anchorSelector).trigger('mouseup', { force: true });
    });

    moveElement(startEventPosition, startEventPosition.y + 50, startEventPosition.y);

    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();

    const newStartEventPosition = { x: startEventPosition.x, y: startEventPosition.y + 200 };
    moveElement(startEventPosition, newStartEventPosition.x, newStartEventPosition.y);

    getElementAtPosition(newStartEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click('topRight', { force: true });

    cy.get(anchorSelector).then($anchor => {
      /* Anchor should still be on the bottom */
      const { top } = $anchor.position();

      getElementAtPosition(newStartEventPosition).then($task => {
        const { top: startEventTop } = $task.position();

        expect(top).to.be.greaterThan(startEventTop);
      });
    });
  });

  it('connects sequence flows with a straight line', () => {
    const taskPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const endEventPosition = {
      x: taskPosition.x + (taskWidth / 2) - (startEventDiameter / 2) + 1,
      y: taskPosition.y + 200,
    };
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition);

    connectNodesWithFlow('sequence-flow-button', taskPosition, endEventPosition);

    cy.get('.main-paper [data-type="standard.Link"] [joint-selector="line"]').should('have.attr', 'd', 'M 308 326 L 308 450');
  });

  it('retains original background color when it cannot connect to an element', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 250, y: 250 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', taskPosition, startEventPosition);
    getElementAtPosition(startEventPosition, nodeTypes.startEvent).
      then($el => $el.find('[joint-selector="body"]')).
      should('have.attr', 'fill', startColor);
  });

  it('retains original background color when it can connect to an element', () => {
    const endEventPosition = { x: 350, y: 350 };
    const taskPosition = { x: 250, y: 250 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition);

    connectNodesWithFlow('sequence-flow-button', taskPosition, endEventPosition);
    getElementAtPosition(endEventPosition, nodeTypes.endEvent).
      then($el => $el.find('[joint-selector="body"]')).
      should('have.attr', 'fill', endColor);
  });

  it('Retains sequence flows when switching task type', () => {
    const startPosition = { x: 150, y: 150 };
    const taskPosition = { x: 250, y: 250 };
    let numberOfSequenceFlowsAdded = 1;

    const sequenceFlow = '<bpmn:sequenceFlow id="node_4" sourceRef="node_1" targetRef="node_3"';

    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-script-task');
    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.scriptTask);

    connectNodesWithFlow('sequence-flow-button', startPosition, taskPosition);

    getElementAtPosition(taskPosition).then(getLinksConnectedToElement).should($links => {
      expect($links.length).to.eq(numberOfSequenceFlowsAdded);
    });

    assertDownloadedXmlContainsExpected(sequenceFlow);

    waitToRenderAllShapes();

    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    modalConfirm();

    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).then(getLinksConnectedToElement).should($links => {
      expect($links.length).to.eq(numberOfSequenceFlowsAdded);
    });

    const updatedSequenceFlow = '<bpmn:sequenceFlow id="node_4" sourceRef="node_1" targetRef="node_5"';
    assertDownloadedXmlContainsExpected(updatedSequenceFlow);
  });
});
