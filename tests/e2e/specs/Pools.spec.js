import {
  dragFromSourceToDest,
  getElementAtPosition,
  getCrownButtonForElement,
  waitToRenderAllShapes,
  typeIntoTextInput,
} from '../support/utils';

describe('Pools', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update pool name', () => {
    const testString = 'testing';

    dragFromSourceToDest(
      'processmaker-modeler-pool',
      '.paper-container',
      200, 200
    );

    cy.get('.joint-viewport').find('.joint-type-processmaker-modeler-bpmn-pool').click({force: true});
    typeIntoTextInput('[name=\'name\']', testString);
    cy.get('[name=\'name\']').should('have.value', testString);
  });

  it('Can add top and bottom lane', () => {
    const poolPosition = { x: 200, y: 200 };

    dragFromSourceToDest(
      'processmaker-modeler-pool',
      '.paper-container',
      poolPosition,
    );

    waitToRenderAllShapes();

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-above-button').click();
        getCrownButtonForElement($pool, 'lane-below-button').click();
      });
  });
});
