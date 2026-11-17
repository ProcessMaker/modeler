import {
  addNodeTypeToPaper,
  clickAndDropElement,
  getElementAtPosition,
  waitToRenderAllShapes,
} from '../support/utils';
import { crownTypeSelectors, nodeTypes } from '../support/constants';

describe('Embedded Sub Process', { scrollBehavior: false }, () => {
  const embeddedPosition = { x: 350, y: 250 };

  it('can drill into an embedded subprocess and return to the main process', () => {
    waitToRenderAllShapes();

    addNodeTypeToPaper(embeddedPosition, nodeTypes.task, crownTypeSelectors.embeddedSubProcess);
    waitToRenderAllShapes();

    getElementAtPosition(embeddedPosition).click({ force: true });
    getElementAtPosition(embeddedPosition).getType().should('equal', nodeTypes.embeddedSubProcess);
    cy.get('[data-test=edit-embedded-subprocess-button]').click({ force: true });

    cy.get('[data-test=exit-sub-process]').should('be.visible');
    cy.get('[data-test=active-sub-process-label]').should('contain.text', 'Sub Process');

    const innerStartPosition = { x: 200, y: 250 };
    clickAndDropElement(nodeTypes.startEvent, innerStartPosition);
    waitToRenderAllShapes();

    cy.get('[data-test=exit-sub-process]').click();
    cy.get('[data-test=exit-sub-process]').should('not.exist');

    getElementAtPosition(embeddedPosition).click({ force: true });
    getElementAtPosition(embeddedPosition).getType().should('equal', nodeTypes.embeddedSubProcess);
  });
});