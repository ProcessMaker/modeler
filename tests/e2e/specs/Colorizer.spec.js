import {
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  dragFromSourceToDest,
  getElementAtPosition,
  uploadXml,
} from '../support/utils';
import { baseNodeColors } from '../../../src/components/nodeColors';
import { nodeTypes } from '../support/constants';
import tinycolor from 'tinycolor2';

describe('Crown color picker', () => {
  const colorToSelect = baseNodeColors[0];

  it('should set color on element', () => {
    const startEventPosition = { x: 150, y: 150 };

    assertDownloadedXmlDoesNotContainExpected('color=');

    getElementAtPosition(startEventPosition).click();
    cy.get('[data-test="picker-dropdown-button"]').click();
    cy.get(`[data-test="${colorToSelect}"]`).click();

    assertDownloadedXmlContainsExpected(`color="${colorToSelect}"`);
  });

  it('should clear color from element', () => {
    const poolPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition, nodeTypes.pool).click();
    cy.get('[data-test="picker-dropdown-button"]').click({ force: true });
    cy.get(`[data-test="${colorToSelect}"]`).click({ force: true });
    cy.get('[data-test="clear-color"]').click({ force: true });

    assertDownloadedXmlDoesNotContainExpected('color=');
  });

  it('should load color from BPMN', () => {
    uploadXml('taskWithColor.xml');

    const fillColor = tinycolor(colorToSelect).lighten(35).toHex8String();

    cy.get('.main-paper [joint-selector="body"]')
      .should('have.attr', 'fill', fillColor)
      .should('have.attr', 'stroke', colorToSelect);
  });

  it('should load color prop for boundary events', () => {
    uploadXml('taskWithColoredBoundaryEvent.xml');

    const boundaryEventSelector = '.main-paper [data-type="processmaker.components.nodes.boundaryEvent.Shape"] [joint-selector="body"]';
    const fillColor = tinycolor(colorToSelect).lighten(35).toHex8String();

    cy.get(boundaryEventSelector)
      .should('have.attr', 'fill', fillColor)
      .should('have.attr', 'stroke', colorToSelect);
  });
});
