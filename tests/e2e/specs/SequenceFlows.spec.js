import {
  dragFromSourceToDest,
  connectNodesWithFlow,
  getElementAtPosition,
  getLinksConnectedToElement,
  typeIntoTextInput,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Sequence Flows', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

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

  it('Update Condition expression', () => {
    const exclusiveGatewayPosition = { x: 400, y: 300 };
    dragFromSourceToDest(nodeTypes.exclusiveGateway, exclusiveGatewayPosition);

    const taskPosition = { x: 400, y: 500 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', exclusiveGatewayPosition, taskPosition);

    getElementAtPosition(exclusiveGatewayPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    const testString = 'foo > 7';
    typeIntoTextInput('[name=conditionExpression]', testString);
    cy.get('[name=conditionExpression]').should('have.value', testString);
  });

  it('Allows modifying anchor points', function() {
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
});
