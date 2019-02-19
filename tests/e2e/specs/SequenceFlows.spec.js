import {
  dragFromSourceToDest,
  connectNodesWithFlow,
  getElementAtPosition,
  getLinksConnectedToElement,
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

    const numberOfSequenceFlowsAdded = 1;

    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links.length).to.eq(numberOfSequenceFlowsAdded);
      });
  });
});
