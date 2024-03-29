import {
  assertDownloadedXmlContainsExpected,
  connectNodesWithFlow,
  clickAndDropElement,
  getElementAtPosition,
  getLinksConnectedToElement,
  modalConfirm,
  waitToRenderAllShapes,
  waitForAnimations,
  removeStartEvent,
} from '../support/utils';

import { direction } from '../../../src/components/nodes/association/associationConfig';
import { nodeTypes } from '../support/constants';

describe('Association Flows', () => {
  it('Change direction of association to none, one and both', () => {
    const directionSelectSelector = '[name=associationDirection]';
    const textAnnotationPosition = { x: 400, y: 100 };
    clickAndDropElement(nodeTypes.textAnnotation, textAnnotationPosition);

    const taskPosition = { x: 400, y: 300 };
    clickAndDropElement(nodeTypes.task, taskPosition);

    connectNodesWithFlow('association-flow-button', textAnnotationPosition, taskPosition);

    getElementAtPosition(textAnnotationPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click();

    cy.get(directionSelectSelector).select('None', { force: true });
    cy.get(directionSelectSelector).should('have.value', direction.none);

    cy.get(directionSelectSelector).select('One', { force: true });
    cy.get(directionSelectSelector).should('have.value', direction.one);

    cy.get(directionSelectSelector).select('Both', { force: true });
    cy.get(directionSelectSelector).should('have.value', direction.both);
  });

  it('should keep association flow when changing element type', () => {
    const startEventPosition = { x: 400, y: 100 };
    const textAnnotationPosition = { x: 150, y: 150 };
    removeStartEvent();
    clickAndDropElement(nodeTypes.startEvent, startEventPosition);
    clickAndDropElement(nodeTypes.textAnnotation, textAnnotationPosition);
    waitToRenderAllShapes();

    connectNodesWithFlow('association-flow-button', textAnnotationPosition, { x: 420, y: 160 });
    waitToRenderAllShapes();

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
      <bpmn:association id="node_4" associationDirection="None" sourceRef="node_3" targetRef="node_5" />
    `);
  });
});
