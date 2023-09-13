const { nodeTypes } = require('../../support/constants');
const {
  clickAndDropElement,
  waitToRenderAllShapes, getCrownButtonForElement,
} = require('../../support/utils');

describe('Inspector panel test', { scrollBehavior: false }, () => {

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


  it('should open preview panel when clicks on preview icon', () => {
    const taskPosition = { x: 500, y: 500 };
    clickAndDropElement(nodeTypes.task, taskPosition);
    crown('preview-button');
  });

});

function crown(buttonId)
{
  getCrownButtonForElement(null, buttonId).click({ force: true });
}
