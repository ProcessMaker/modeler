import {nodeTypes} from '../support/constants';
import {
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  dragFromSourceToDest, getCrownButtonForElement, getElementAtPosition, modalAnimationTime,
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
  const deleteElement = (position, type) => {
    getElementAtPosition(position, type)
      .click({ force: true })
      .then($element => {
        getCrownButtonForElement($element, 'delete-button').click({ force: true });
      });
  };

  it('has a dedicated documentation inspector accordion', () => {
    baseElements
      .forEach(type => {
        cy.clock();

        dragFromSourceToDest(type, position);
        cy.get('[name="documentation"]').as('documentation').should('not.be.visible');
        cy.contains('Advanced').click();
        cy.tick(accordionOpenAnimationTime);
        cy.get('@documentation').should('not.be.visible');
        cy.contains('Documentation').click();
        cy.tick(accordionOpenAnimationTime);
        cy.get('@documentation').should('be.visible');

        deleteElement(position, type);

        cy.clock().invoke('restore');
      });
  });

  it('should add and remove documentation to element', () => {
    baseElements
      .forEach(type => {
        cy.clock();
        const docString = `${type} doc!`;

        dragFromSourceToDest(type, position);
        cy.contains('Documentation').click();
        cy.tick(accordionOpenAnimationTime);
        cy.get('[name="documentation"]').clear().type(docString);
        assertDownloadedXmlContainsExpected(docString);

        cy.get('[name="documentation"]').clear();
        assertDownloadedXmlDoesNotContainExpected('bpmn:documentation');

        deleteElement(position, type);

        cy.clock().invoke('restore');
      });
  });

  it('can allow the documentation editor modal to edit the documentation', () => {
    dragFromSourceToDest(nodeTypes.task, position);
    cy.contains('Documentation').click();
    cy.wait(accordionOpenAnimationTime);

    const documentationFromInspector = 'some documentation';
    cy.get('[data-test="documentation-text-area"]').type(documentationFromInspector);
    cy.wait(modalAnimationTime);

    cy.get('[data-test="documentation-modal-button"]').click();

    const documentationFromModal = 'this is the documentation modal';
    cy.get('[data-test="documentation-modal-text-area"]').type(documentationFromModal);

    cy.contains('Close').click();
    cy.wait(modalAnimationTime);

    cy.get('[data-test="documentation-text-area"]').should('have.value', `${documentationFromInspector}${documentationFromModal}`);

    assertDownloadedXmlContainsExpected(`${documentationFromInspector}${documentationFromModal}`);
  });
});
