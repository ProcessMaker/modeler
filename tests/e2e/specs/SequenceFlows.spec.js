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

    dragFromSourceToDest(nodeTypes.task, '.paper-container', taskPosition);

    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    const numberOfSequenceFlowsAdded = 1;

    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links.length).to.eq(numberOfSequenceFlowsAdded);
      });
  });

  it('Have the highest z-index', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 250, y: 250 };
    const poolPosition = { x: 150, y: 150 };

    dragFromSourceToDest(nodeTypes.task, '.paper-container', taskPosition);

    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    dragFromSourceToDest(nodeTypes.pool, '.paper-container', poolPosition);

    // getLastCell - will get the highest cell (element or link) with the highest z property
    cy.window().its('store.state.graph')
      .invoke('getLastCell').
      then(cell => {
        const sequenceFlow = 'processmaker-modeler-sequence-flow';
        expect(cell.component.node.type).to.eq(sequenceFlow);
      });
  });

  it('Update Condition expression', () => {
    const exclusiveGatewayPosition = { x: 400, y: 300 };
    dragFromSourceToDest(
      'processmaker-modeler-exclusive-gateway',
      '.paper-container',
      exclusiveGatewayPosition
    );

    const taskPosition = { x: 400, y: 500 };
    dragFromSourceToDest(
      nodeTypes.task,
      '.paper-container',
      taskPosition
    );

    connectNodesWithFlow('sequence-flow-button', exclusiveGatewayPosition, taskPosition);

    getElementAtPosition(exclusiveGatewayPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    const testString = 'foo > 7';
    typeIntoTextInput('[name=\'conditionExpression.body\']', testString);
    cy.get('[name=\'conditionExpression.body\']').should('have.value', testString);
  });
});
