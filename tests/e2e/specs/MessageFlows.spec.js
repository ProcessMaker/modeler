import {
  dragFromSourceToDest,
  getElementAtPosition,
  getCrownButtonForElement,
  getLinksConnectedToElement,
} from '../support/utils';

function connectNodesWithMessageFlow(startPosition, endPosition) {
  getElementAtPosition(startPosition)
    .click()
    .then($element => {
      getCrownButtonForElement($element, 'message-flow-button')
        .click();
    })
    .then(() => {
      getElementAtPosition(endPosition)
        .trigger('mousemove')
        .click();
    });
}

describe('Message Flows', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Can connect two pools with a message flow', () => {
    const pool1Position = { x: 250, y: 250 };
    dragFromSourceToDest('processmaker-modeler-pool', '.paper-container', pool1Position);

    const pool2Position = { x: 250, y: 500 };
    dragFromSourceToDest('processmaker-modeler-pool', '.paper-container', pool2Position);

    connectNodesWithMessageFlow(pool1Position, pool2Position);

    const numberOfMessageFlowsAdded = 1;
    getElementAtPosition(pool2Position)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links.length).to.eq(numberOfMessageFlowsAdded);
      });
  });
});
