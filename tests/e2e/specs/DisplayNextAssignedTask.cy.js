
const { nodeTypes } = require('../support/constants');
const {
  clickAndDropElement,
  waitToRenderAllShapes,
  getElementAtPosition,
  toggleInspector,
} = require('../support/utils');

// Test suite for Display Next Assigned Task functionality
describe('Display Next Assigned Task', { scrollBehavior: false }, () => {

  // Setup before each test
  beforeEach(() => {
    toggleInspector();
  });

  // Step 1: Test selecting Display Next Assigned Task option
  it('should select Display Next Assigned Task as element destination type', () => {
    const manualTaskPosition = { x: 300, y: 200 };
    clickAndDropElement(nodeTypes.task, manualTaskPosition);
    waitToRenderAllShapes();
    getElementAtPosition(manualTaskPosition).click();
    
    // Verify element destination dropdown exists and select option
    cy.get('[data-test=element-destination-type]').should('exist').click();
    cy.get('[id=option-1-6]').click();
    
    // Verify selected option is displayed correctly
    cy.get('[class=multiselect__single]').should('exist').contains('Display Next Assigned Task');
  });
});
