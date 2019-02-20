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

  it('Have the highest z-index', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 250, y: 250 };
    const poolPosition = { x: 150, y: 150 };

    dragFromSourceToDest('processmaker-modeler-task', '.paper-container', taskPosition);

    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    dragFromSourceToDest('processmaker-modeler-pool', '.paper-container', poolPosition);

    // getLastCell - will get the highest cell (element or link) with the highest z property
    cy.window().its('store.state.graph')
      .invoke('getLastCell').
      then(cell => {
        const sequenceFlow = 'processmaker-modeler-sequence-flow';
        expect(cell.component.node.type).to.eq(sequenceFlow);
      });
  });
});
