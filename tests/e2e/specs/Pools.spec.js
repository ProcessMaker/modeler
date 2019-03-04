import {
  dragFromSourceToDest,
  getElementAtPosition,
  getCrownButtonForElement,
  waitToRenderAllShapes,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Pools', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update pool name', () => {
    const testString = 'testing';

    const poolPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    waitToRenderAllShapes();
    getElementAtPosition(poolPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Can add top and bottom lane', () => {
    const poolPosition = { x: 200, y: 200 };

    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    waitToRenderAllShapes();

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-above-button').click();
        getCrownButtonForElement($pool, 'lane-below-button').click();
      });
  });
});
