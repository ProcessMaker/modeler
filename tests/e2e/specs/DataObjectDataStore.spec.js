import {
  dragFromSourceToDest, getCrownButtonForElement,
  getElementAtPosition,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Data Objects and Data Stores', () => {
  const position = {x: 250, y: 250};

  it('does not support connecting sequence flows', () => {
    dragFromSourceToDest(nodeTypes.dataObject, position);

    getElementAtPosition(position)
      .click()
      .then($el => getCrownButtonForElement($el, 'sequence-flow-button'))
      .should('not.exist');
  });
});
