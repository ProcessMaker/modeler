import {
  connectNodesWithFlow,
  dragFromSourceToDest, getCrownButtonForElement,
  getElementAtPosition, getNumberOfLinks,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Data Objects and Data Stores', () => {
  const dataPosition = {x: 250, y: 250};
  const startEventPosition = {x: 150, y: 150};

  [nodeTypes.dataObject, nodeTypes.dataStore].forEach(nodeType => {
    it(`does not support connecting sequence flows for ${nodeType}`, () => {
      dragFromSourceToDest(nodeType, dataPosition);

      getElementAtPosition(dataPosition)
        .click()
        .then($el => getCrownButtonForElement($el, 'sequence-flow-button'))
        .should('not.exist');

      connectNodesWithFlow('sequence-flow-button', startEventPosition, dataPosition);
      getNumberOfLinks().should('equal', 0);
    });
  });
});
