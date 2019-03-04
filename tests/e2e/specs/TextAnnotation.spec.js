import {
  dragFromSourceToDest,
  typeIntoTextInput,
  waitToRenderAllShapes,
  getElementAtPosition,
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

    waitToRenderAllShapes();
    getElementAtPosition(textAnnotationPosition).click();

    typeIntoTextInput('[name=text]', testString);
    cy.get('[name=text]').should('have.value', testString);
  });
});
