import {nodeTypes} from '../support/constants';
import {
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  dragFromSourceToDest, getCrownButtonForElement, getElementAtPosition, waitToRenderAllShapes,
} from '../support/utils';

describe('Documentation accordion', () => {
  const baseElements = [
    nodeTypes.startEvent,
    nodeTypes.intermediateCatchEvent,
    nodeTypes.endEvent,
    nodeTypes.task,
    nodeTypes.exclusiveGateway,
    nodeTypes.pool,
    nodeTypes.textAnnotation,
    nodeTypes.dataObject,
    nodeTypes.dataStore,
  ];
  const position = { x: 300, y: 300 };
  const accordionOpenAnimationTime = 500;

  it('has a dedicated documentation inspector accordion', () => {
    baseElements
      .forEach(type => {
        dragFromSourceToDest(type, position);
        cy.get('[name="documentation"]').as('documentation').should('not.be.visible');
        cy.contains('Advanced').click();
        cy.wait(accordionOpenAnimationTime);
        cy.get('@documentation').should('not.be.visible');
        cy.contains('Documentation').click();
        cy.get('@documentation').should('be.visible');

        getElementAtPosition(position, type)
          .click({ force: true })
          .then($element => {
            getCrownButtonForElement($element, 'delete-button').click({ force: true });
          });
      });
  });

  it.skip('should add and remove documentation to element', () => {
    baseElements
      .forEach(type => {
        const docString = `${type} doc!`;

        dragFromSourceToDest(type, position);
        cy.contains('Advanced').click();
        cy.get('[name="documentation"]').clear().type(docString);
        assertDownloadedXmlContainsExpected(docString);

        cy.get('[name="documentation"]').clear();
        assertDownloadedXmlDoesNotContainExpected('bpmn:documentation');

        getElementAtPosition(position, type)
          .click({ force: true })
          .then($element => {
            getCrownButtonForElement($element, 'delete-button').click({ force: true });
          });
      });
  });
});
