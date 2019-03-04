import {
  dragFromSourceToDest,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Text Annotation', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update text annotation name', () => {
    const testString = 'testing';

    dragFromSourceToDest(
      nodeTypes.textAnnotation,
      '.paper-container',
      200, 200
    );

    cy.get('.joint-viewport').find('.joint-type-standard-polyline').click({force: true});
    typeIntoTextInput('[name=text]', testString);
    cy.get('[name=text]').should('have.value', testString);
  });
});
