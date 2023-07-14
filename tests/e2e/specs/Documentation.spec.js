import {nodeTypes} from '../support/constants';
import {
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  clickAndDropElement,
  getCrownButtonForElement,
  getElementAtPosition,
  getTinyMceEditor,
  getTinyMceEditorInModal,
  modalAnimationTime,
  toggleInspector,
  waitToRenderAllShapes,
} from '../support/utils';

describe('Documentation accordion', { scrollBehavior: false }, () => {
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

  beforeEach(() => {
    toggleInspector();
  });

  it('has a dedicated documentation inspector accordion', () => {
    baseElements
      .forEach(type => {
        cy.clock();

        clickAndDropElement(type, position);
        waitToRenderAllShapes();
        cy.get('iframe.tox-edit-area__iframe').should('not.be.visible');
        cy.contains('Advanced').click();
        cy.tick(accordionOpenAnimationTime);
        cy.get('iframe.tox-edit-area__iframe').should('not.be.visible');
        cy.contains('Documentation').click();
        cy.tick(accordionOpenAnimationTime);
        getTinyMceEditor().should('be.visible');

        deleteElement(position, type);

        cy.clock().invoke('restore');
      });
  });

  it('should add and remove documentation to element', () => {
    baseElements
      .forEach(type => {
        cy.clock();
        const docString = `${type} doc!`;

        clickAndDropElement(type, position);
        waitToRenderAllShapes();
        cy.contains('Documentation').click();
        cy.tick(accordionOpenAnimationTime);
        getTinyMceEditor().clear().type(docString);
        assertDownloadedXmlContainsExpected(docString);

        getTinyMceEditor().clear();
        assertDownloadedXmlDoesNotContainExpected('bpmn:documentation');

        deleteElement(position, type);

        cy.clock().invoke('restore');
      });
  });

  it('can allow the documentation editor modal to edit the documentation', () => {
    clickAndDropElement(nodeTypes.task, position);
    waitToRenderAllShapes();
    cy.contains('Documentation').click();
    cy.wait(accordionOpenAnimationTime);

    const documentationFromInspector = 'some documentation';
    getTinyMceEditor().type(documentationFromInspector);
    cy.wait(modalAnimationTime);

    cy.get('[data-test="documentation-modal-button"]').click();

    const documentationFromModal = 'this is the documentation modal';
    getTinyMceEditorInModal().type(documentationFromModal);

    cy.contains('Close').click();
    cy.wait(modalAnimationTime);

    const documentationCombined = `${documentationFromInspector}${documentationFromModal}`;
    getTinyMceEditor().should('have.text', documentationCombined);

    assertDownloadedXmlContainsExpected(documentationCombined);
  });
});
