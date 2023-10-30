const { nodeTypes } = require('../../support/constants');
const {
  clickAndDropElement,
  waitToRenderAllShapes, getCrownButtonForElement, getElementAtPosition,
} = require('../../support/utils');

describe('Inspector panel tests', { scrollBehavior: false }, () => {

  beforeEach(() => {
    cy.get('.control-add').click();
    cy.get('[data-test=processmaker-modeler-start-event] > .pinIcon').click();
    cy.get('[data-test=processmaker-modeler-task] > .pinIcon').click();
    waitToRenderAllShapes();

    cy.get('.control-add').click();
    waitToRenderAllShapes();
    cy.get('[data-test=explorer-rail]').should('not.be.visible');
    waitToRenderAllShapes();
  });

  it('preview icon should  be visible in tasks', () => {

    const taskPosition = { x: 400, y: 100 };
    clickAndDropElement(nodeTypes.task, taskPosition);

    cy.get('[data-test=preview-button]').should('be.visible');
  });

  it('should open preview panel when clicks on preview icon', () => {
    const taskPosition = { x: 500, y: 500 };
    clickAndDropElement(nodeTypes.task, taskPosition);
    //const previewButton = crown('preview-button');

    getElementAtPosition(taskPosition)
      .then($task => {
        getCrownButtonForElement($task, 'preview-button').click({ force: true });
      });

    cy.get('[data-test=preview-panel]').should('be.visible');

  });

  it('preview icon should not be visible in start or end events', () => {

    const startEventPosition = { x: 500, y: 500 };
    clickAndDropElement(nodeTypes.startEvent, startEventPosition);
    cy.get('[data-test=preview-button]').should('not.exist');

    const endEventPosition = { x: 100, y: 800 };
    clickAndDropElement(nodeTypes.endEvent, endEventPosition);
    cy.get('[data-test=preview-button]').should('not.exist');
  });

  it.only('preview icon should switch between displaying and hiding the preview pane', () => {
    const taskPosition = { x: 400, y: 100 };
    clickAndDropElement(nodeTypes.task, taskPosition);

    getElementAtPosition(taskPosition)
      .then($task => {
        getCrownButtonForElement($task, 'preview-button').click({ force: true });
        cy.get('[data-test=preview-panel]').should('be.visible');

        getCrownButtonForElement($task, 'preview-button').click({ force: true });
        cy.get('[data-test=preview-panel]').should('not.be.visible');
      });
  });
});
