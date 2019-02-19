import {
  dragFromSourceToDest,
  getElementAtPosition,
  getLinksConnectedToElement,
  connectNodesWithFlow,
} from '../support/utils';

import { direction } from '../../../src/components/nodes/association/associationConfig';

describe('Association Flows', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Change direction of association to none, one and both', () => {
    const directionSelectSelector = '[name=\'associationDirection\']';
    const testDirection = {
      none:`${ direction.none }`,
      one: `${ direction.one }`,
      both:`${ direction.both }`,
    };

    const textAnnotationPosition = { x: 400, y: 100 };
    dragFromSourceToDest(
      'processmaker-modeler-text-annotation',
      '.paper-container',
      textAnnotationPosition,
    );

    const taskPosition = { x: 400, y: 300 };
    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      taskPosition,
    );

    connectNodesWithFlow('association-flow-button', textAnnotationPosition, taskPosition);

    getElementAtPosition(textAnnotationPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click();

    cy.get(directionSelectSelector).select('none');
    cy.get(directionSelectSelector).should('have.value', testDirection.none);

    cy.get(directionSelectSelector).select('one');
    cy.get(directionSelectSelector).should('have.value', testDirection.one);

    cy.get(directionSelectSelector).select('both');
    cy.get(directionSelectSelector).should('have.value', testDirection.both);
  });
});
