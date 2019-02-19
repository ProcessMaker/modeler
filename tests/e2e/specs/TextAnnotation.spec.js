import {
  dragFromSourceToDest,
  typeIntoTextInput,
} from '../support/utils';

describe('Text Annotation', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update text annotation name', () => {
    const testString = 'testing';

    dragFromSourceToDest(
      'processmaker-modeler-text-annotation',
      '.paper-container',
      200, 200
    );

    cy.get('.joint-viewport').find('.joint-type-standard-polyline').click({force: true});
    typeIntoTextInput('[name=\'text\']', testString);
    cy.get('[name=\'text\']').should('have.value', testString);
  });
});
