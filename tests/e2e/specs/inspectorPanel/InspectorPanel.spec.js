const { nodeTypes } = require('../../support/constants');
const {
  clickAndDropElement,
  waitToRenderAllShapes,
  getElementAtPosition,
} = require('../../support/utils');

describe.skip('Inspector panel test', { scrollBehavior: false }, () => {
  const inspectorButtonSelector = '[data-cy="inspector-button"]';
  const inspectorPanelSelector = '[data-cy="inspector-panel"]';
  const inspectorCloseButton = '[data-cy="inspector-close-button"]';

  beforeEach(() => {
    cy.get('[data-test=processmaker-modeler-start-event] > .pinIcon').click();
    cy.get('[data-test=processmaker-modeler-task] > .pinIcon').click();
    waitToRenderAllShapes();

    cy.get('.control-add').click();
    waitToRenderAllShapes();
    cy.get('[data-test=explorer-rail]').should('not.exist');
    waitToRenderAllShapes();
  });

  it('should render new inspector button', () => {
    cy.get(inspectorButtonSelector)
      .should('be.visible')
      .then($btn => {
        expect($btn).to.have.css('width', '48px');
        expect($btn).to.have.css('height', '48px');
        expect($btn).to.have.css('background-color', 'rgb(255, 255, 255)');
        expect($btn).to.have.css('border-radius', '4px');
        expect($btn).to.have.css('box-shadow', 'rgba(0, 0, 0, 0.1) 0px 4px 8px 0px');

        const icon = $btn.children('svg');
        expect(icon).to.have.css('fill', 'rgb(68, 73, 78)');
      });
  });

  it('should open inspector panel when clicks on inspector button', () => {
    cy.get(inspectorButtonSelector).click();
    cy.get(inspectorPanelSelector).should('be.visible');
  });

  it('should close inspector panel when clicks on inspector close button', () => {
    cy.get(inspectorButtonSelector).click();
    cy.get(inspectorPanelSelector).should('be.visible');
    cy.wait(500);
    cy.get(inspectorCloseButton).click();
    cy.get(inspectorPanelSelector).should('not.be.visible');
  });

  it('should hide inspector panel when select startElement and taskElement with shift key', () => {
    cy.get(inspectorButtonSelector).click();
    cy.get(inspectorPanelSelector).should('be.visible');

    cy.wait(500);

    const startPosition = { x: 210, y: 200 };
    const taskPosition = { x: 350, y: 200 };

    clickAndDropElement(nodeTypes.task, taskPosition);

    waitToRenderAllShapes();

    getElementAtPosition(startPosition)
      .click();

    getElementAtPosition(taskPosition)
      .click({ shiftKey: true });

    cy.get(inspectorPanelSelector).should('not.be.visible');
  });

  it('should show inspector panel deselect startElement and taskElement', () => {
    cy.get(inspectorButtonSelector).click();
    cy.get(inspectorPanelSelector).should('be.visible');

    cy.wait(500);

    const startPosition = { x: 210, y: 200 };
    const taskPosition = { x: 350, y: 200 };

    clickAndDropElement(nodeTypes.task, taskPosition);

    waitToRenderAllShapes();

    getElementAtPosition(startPosition)
      .click();

    getElementAtPosition(taskPosition)
      .click({ shiftKey: true });

    cy.get(inspectorPanelSelector).should('not.be.visible');

    cy.wait(500);

    getElementAtPosition(startPosition)
      .click();

    cy.get(inspectorPanelSelector).should('be.visible');
  });
});
