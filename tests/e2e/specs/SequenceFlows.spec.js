import {
  dragFromSourceToDest,
  getElementAtPosition,
  getCrownButtonForElement,
  getLinksConnectedToElement,
} from '../support/utils';

describe('Sequence Flows', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Can connect two elements', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 250, y: 250 };

    dragFromSourceToDest('processmaker-modeler-tast', '.paper-container', taskPosition);
  });
});
