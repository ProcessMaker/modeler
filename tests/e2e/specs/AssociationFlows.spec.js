import {
  dragFromSourceToDest,
  getElementAtPosition,
  getLinksConnectedToElement,
  connectNodesWithFlow,
} from '../support/utils';

import { direction } from '../../../src/components/nodes/association/associationConfig';
import { nodeTypes } from '../support/constants';

describe('Association Flows', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Change direction of association to none, one and both', () => {
    const directionSelectSelector = '[name=associationDirection]';
    const testDirection = {
      none:`${ direction.none }`,
      one: `${ direction.one }`,
      both:`${ direction.both }`,
    };

    const textAnnotationPosition = { x: 400, y: 100 };
    dragFromSourceToDest(nodeTypes.textAnnotation, textAnnotationPosition);

    const taskPosition = { x: 400, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('association-flow-button', textAnnotationPosition, taskPosition);

    getElementAtPosition(textAnnotationPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click();

    cy.get(directionSelectSelector).select('None');
    cy.get(directionSelectSelector).should('have.value', testDirection.none);

    cy.get(directionSelectSelector).select('One');
    cy.get(directionSelectSelector).should('have.value', testDirection.one);

    cy.get(directionSelectSelector).select('Both');
    cy.get(directionSelectSelector).should('have.value', testDirection.both);
  });
});
