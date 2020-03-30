import {
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  dragFromSourceToDest,
  getElementAtPosition,
  uploadXml,
} from '../support/utils';
import { baseNodeColors } from '../../../src/components/nodeColors';
import { nodeTypes } from '../support/constants';
import Color from 'color';

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

    const fillColor = Color(colorToSelect).lighten(0.4).hex();

    cy.get('.main-paper [joint-selector="body"]')
      .should('have.attr', 'fill', fillColor)
      .should('have.attr', 'stroke', colorToSelect);
  });
});
