import {
  assertDownloadedXmlContainsExpected,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getElementAtPosition,
  getLinksConnectedToElement,
  modalConfirm, waitToRenderAllShapes, waitForAnimations,
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

  it('should keep association flow when changing element type', () => {
    const startEventPosition = { x: 150, y: 150 };
    const textAnnotationPosition = { x: 400, y: 100 };
    dragFromSourceToDest(nodeTypes.textAnnotation, textAnnotationPosition);
    waitToRenderAllShapes();

    connectNodesWithFlow('association-flow-button', textAnnotationPosition, startEventPosition);

    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-start-timer-event]').click();
    modalConfirm();
    waitForAnimations();

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links).to.have.lengthOf(1);
      });

    assertDownloadedXmlContainsExpected(`
      <bpmn:association id="node_3" associationDirection="None" sourceRef="node_2" targetRef="node_4" />
    `);
  });
});
