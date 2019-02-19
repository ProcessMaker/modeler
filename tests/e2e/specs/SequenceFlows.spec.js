import {
  dragFromSourceToDest,
  connectNodesWithFlow,
} from '../support/utils';

describe('Sequence Flows', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Can connect two elements', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 250, y: 250 };

    dragFromSourceToDest('processmaker-modeler-task', '.paper-container', taskPosition);

    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);
  });
});
