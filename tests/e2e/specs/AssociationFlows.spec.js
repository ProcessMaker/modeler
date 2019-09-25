import {
  connectNodesWithFlow,
  dragFromSourceToDest,
  getElementAtPosition,
  getLinksConnectedToElement,
} from '../support/utils';

import { direction } from '../../../src/components/nodes/association/associationConfig';
import { nodeTypes } from '../support/constants';

describe('Association Flows', () => {
  it('Change direction of association to none, one and both', () => {
    const directionSelectSelector = '[name=associationDirection]';
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
    cy.get(directionSelectSelector).should('have.value', direction.none);

    cy.get(directionSelectSelector).select('One');
    cy.get(directionSelectSelector).should('have.value', direction.one);

    cy.get(directionSelectSelector).select('Both');
    cy.get(directionSelectSelector).should('have.value', direction.both);
  });
});
