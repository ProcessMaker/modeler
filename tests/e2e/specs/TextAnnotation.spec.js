import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
  connectNodesWithFlow,
  getCrownButtonForElement,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Text Annotation', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update text annotation name', () => {
    const testString = 'testing';

    const textAnnotationPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.textAnnotation, textAnnotationPosition);

    getElementAtPosition(textAnnotationPosition).click();

    typeIntoTextInput('[name=text]', testString);
    cy.get('[name=text]').should('have.value', testString);
  });

  it('Save a process with text annotation, pool and lane', function() {
    if (!Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const poolPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-above-button').click({ force: true });
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });

    const textAnnotationPosition = { x: 400, y: 100 };
    dragFromSourceToDest(nodeTypes.textAnnotation, textAnnotationPosition);

    const taskPosition = { x: 400, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('association-flow-button', textAnnotationPosition, taskPosition);

    cy.get('[data-test=save-process]').click();

    const successMessage = 'The process was saved.';

    cy.get('.alert-success').contains(successMessage);

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'delete-button').click({ force: true });
      });

    cy.get('[data-test=save-process]').click();
  });
});
