import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  getElementAtPosition,
  toggleInspector,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

const intermediateMessageThrowEventPosition = { x: 400, y: 100 };

describe('Intermediate Message Throw Event Data Inputs', { scrollBehavior: false }, () => {
  beforeEach(() => {
    toggleInspector();
  });

  it('should render intermediate message throw event inspector with data input configuration', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Verify the Data Inputs & Assignments accordion is visible
    cy.get('#collapse-message-throw-event-data-inputs-accordion').should('exist');
    cy.get('[data-cy="add-data-input"]').should('exist');
  });

  it('should add a new data input with assignments', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Click Add Data Input button
    cy.get('[data-cy="add-data-input"]').click();

    // Wait for the form to be visible
    cy.get('[data-cy="data-input-add-name"]').should('be.visible');

    // Fill in data input details
    cy.get('[data-cy="data-input-add-name"]').type('User Information');

    // Wait for validation to pass
    cy.get('[data-cy="data-input-save"]').should('not.be.disabled');

    // Add assignment expressions
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('user.fullname', { force: true });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('user.email', { force: true });

    // Save the data input
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify the data input appears in the list
    cy.get('.data-input-item').should('contain', 'User Information');

    // Debug: Log the content of the data input item
    cy.get('.data-input-item').then(($el) => {
      cy.log('Data input item content:', $el.text());
    });

    // Wait a bit for the UI to update
    cy.wait(1000);

    // Verify assignments are displayed
    cy.get('.data-input-item').should('contain', 'user.fullname');
    cy.get('.data-input-item').should('contain', 'user.email');
  });

  it('should edit an existing data input', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Add initial data input
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('Initial Name');
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Wait for the data input to be created
    cy.get('.data-input-item').should('contain', 'Initial Name');

    // Edit the data input
    cy.get('[data-cy="edit-data-input"]').click({ force: true });
    
    // Wait for the form to be visible and populated
    cy.get('[data-cy="data-input-add-name"]').should('be.visible');
    cy.get('[data-cy="data-input-add-name"]').should('have.value', 'Initial Name');
    
    // Clear and type new values
    cy.get('[data-cy="data-input-add-name"]').clear().type('Updated Name');

    // Wait for validation to pass
    cy.get('[data-cy="data-input-save"]').should('not.be.disabled');
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Wait for UI to update
    cy.wait(1000);

    // Verify the updated data input
    cy.get('.data-input-item').should('contain', 'Updated Name');
  });

  it('should edit assignment expressions (from and to fields)', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Add initial data input with assignments
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('Assignment Test');
    
    // Add initial assignment
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('initial.from.value', { force: true });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('initial.to.value', { force: true });
    
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Wait for the data input to be created
    cy.get('.data-input-item').should('contain', 'Assignment Test');
    cy.get('.data-input-item').should('contain', 'initial.from.value');
    cy.get('.data-input-item').should('contain', 'initial.to.value');

    // Edit the data input to modify assignments
    cy.get('[data-cy="edit-data-input"]').click({ force: true });
    
    // Wait for the form to be visible and populated
    cy.get('[data-cy="data-input-add-name"]').should('be.visible');
    cy.get('[data-cy="data-input-add-name"]').should('have.value', 'Assignment Test');
    
    // Wait a bit for the assignment fields to be rendered
    cy.wait(500);
    
    // Verify initial assignment values are loaded
    cy.get('textarea[placeholder*="firstname"]').first().should('contain.value', 'initial.from.value');
    cy.get('textarea[placeholder*="user.firstname"]').first().should('contain.value', 'initial.to.value');
    
    // Edit the existing assignment
    cy.get('textarea[placeholder*="firstname"]').first().clear({ force: true }).type('updated.from.value', { force: true });
    cy.get('textarea[placeholder*="user.firstname"]').first().clear({ force: true }).type('updated.to.value', { force: true });
    
    // Add a second assignment
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').eq(1).type('second.from.value', { force: true });
    cy.get('textarea[placeholder*="user.firstname"]').eq(1).type('second.to.value', { force: true });

    // Save the changes
    cy.get('[data-cy="data-input-save"]').should('not.be.disabled');
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Wait for UI to update
    cy.wait(1000);

    // Verify the updated assignments are displayed
    cy.get('.data-input-item').should('contain', 'updated.from.value');
    cy.get('.data-input-item').should('contain', 'updated.to.value');
    cy.get('.data-input-item').should('contain', 'second.from.value');
    cy.get('.data-input-item').should('contain', 'second.to.value');
    
    // Verify the old values are no longer present
    cy.get('.data-input-item').should('not.contain', 'initial.from.value');
    cy.get('.data-input-item').should('not.contain', 'initial.to.value');
  });

  it('should delete a data input', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Add a data input
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('To Delete');
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify it exists
    cy.get('.data-input-item').should('contain', 'To Delete');

    // Delete it
    cy.get('[data-cy="remove-data-input"]').click({ force: true });
    cy.get('[data-cy="data-input-delete"]').click({ force: true });

    // Verify it's gone
    cy.get('.data-input-item').should('not.exist');
  });

  it('should validate data input name and ID', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    cy.get('[data-cy="add-data-input"]').click();

    // Wait for form to be visible
    cy.get('[data-cy="data-input-add-name"]').should('be.visible');

    // Check initial state - save button should be disabled (no name)
    cy.get('[data-cy="data-input-save"]').should('be.disabled');

    // Add name - should now be enabled
    cy.get('[data-cy="data-input-add-name"]').type('Test Name');
    cy.get('[data-cy="data-input-save"]').should('not.be.disabled');
  });

  it('should persist data inputs after save and reload', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Add data input with assignments
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('Persistent Data');

    // Add assignment
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('persistent.value', { force: true });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('persistent.value', { force: true });

    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify data input exists
    cy.get('.data-input-item').should('contain', 'Persistent Data');

    // Click away and back to trigger save
    cy.get('[aria-label="Toolbar"]').click();
    getElementAtPosition(intermediateMessageThrowEventPosition).click();

    // Verify data input still exists after reload
    cy.get('.data-input-item').should('contain', 'Persistent Data');

    // Verify assignments are still there
    cy.get('.data-input-item').should('contain', 'persistent.value');
  });

  it('should handle multiple data inputs with different assignments', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Add first data input
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('User Data');
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('user', { force: true });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('user', { force: true });
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Add second data input
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('Order Data');
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('order', { force: true });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('order', { force: true });
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify both data inputs exist
    cy.get('.data-input-item').should('have.length', 2);
    cy.get('.data-input-item').first().should('contain', 'User Data');
    cy.get('.data-input-item').last().should('contain', 'Order Data');
  });

  it('should edit assignments in data inputs with complex expressions', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Add data input with complex assignment expressions
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('Complex Expressions');
    
    // Add assignment with complex FEEL expressions
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('{$data["user"]["firstName"]} {$data["user"]["lastName"]}', { force: true, parseSpecialCharSequences: false });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('fullName', { force: true });
    
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify the complex expression is saved
    cy.get('.data-input-item').should('contain', 'Complex Expressions');
    cy.get('.data-input-item').should('contain', '{$data["user"]["firstName"]} {$data["user"]["lastName"]}');
    cy.get('.data-input-item').should('contain', 'fullName');

    // Edit to modify the complex expression
    cy.get('[data-cy="edit-data-input"]').click({ force: true });
    
    // Wait for the form to be visible
    cy.get('[data-cy="data-input-add-name"]').should('be.visible');
    cy.wait(500);
    
    // Verify the complex expression is loaded correctly
    cy.get('textarea[placeholder*="firstname"]').first().should('contain.value', '{$data["user"]["firstName"]} {$data["user"]["lastName"]}');
    cy.get('textarea[placeholder*="user.firstname"]').first().should('contain.value', 'fullName');
    
    // Modify the expression
    cy.get('textarea[placeholder*="firstname"]').first().clear({ force: true }).type('{$data["order"]["id"]} - {$data["order"]["status"]}', { force: true, parseSpecialCharSequences: false });
    cy.get('textarea[placeholder*="user.firstname"]').first().clear({ force: true }).type('orderSummary', { force: true });
    
    // Add another assignment with different complex expression
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').eq(1).type('if($data["user"]["age"] > 18, "adult", "minor")', { force: true, parseSpecialCharSequences: false });
    cy.get('textarea[placeholder*="user.firstname"]').eq(1).type('userCategory', { force: true });

    // Save the changes
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Wait for UI to update
    cy.wait(1000);

    // Verify the updated complex expressions
    cy.get('.data-input-item').should('contain', '{$data["order"]["id"]} - {$data["order"]["status"]}');
    cy.get('.data-input-item').should('contain', 'orderSummary');
    cy.get('.data-input-item').should('contain', 'if($data["user"]["age"] > 18, "adult", "minor")');
    cy.get('.data-input-item').should('contain', 'userCategory');
    
    // Verify old values are gone
    cy.get('.data-input-item').should('not.contain', '{$data["user"]["firstName"]} {$data["user"]["lastName"]}');
    cy.get('.data-input-item').should('not.contain', 'fullName');
  });

  it('should handle empty assignment fields correctly', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Add data input with empty assignment fields
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('Empty Fields Test');
    
    // Add assignment but leave fields empty
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    // Don't type anything in the fields - leave them empty
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify the data input is saved even with empty assignment fields
    cy.get('.data-input-item').should('contain', 'Empty Fields Test');

    // Edit to add values to the empty fields
    cy.get('[data-cy="edit-data-input"]').click({ force: true });
    
    // Verify empty fields are loaded
    cy.get('textarea[placeholder*="firstname"]').first().should('have.value', '');
    cy.get('textarea[placeholder*="user.firstname"]').first().should('have.value', '');
    
    // Add values to the empty fields
    cy.get('textarea[placeholder*="firstname"]').first().type('some.from.value', { force: true });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('some.to.value', { force: true });

    // Save the changes
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Wait for UI to update
    cy.wait(1000);

    // Verify the values are now displayed
    cy.get('.data-input-item').should('contain', 'some.from.value');
    cy.get('.data-input-item').should('contain', 'some.to.value');
  });

  it('should generate correct BPMN XML with data inputs and assignments', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Add data input with assignments
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('Test Input');
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('test.value', { force: true });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('test.value', { force: true });
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify BPMN XML contains the expected elements
    assertDownloadedXmlContainsExpected('<bpmn:intermediateThrowEvent id="node_3" name="Intermediate Message Throw Event">');
    assertDownloadedXmlContainsExpected('<bpmn:dataInput id="din_');
    assertDownloadedXmlContainsExpected('name="Test Input"');
    assertDownloadedXmlContainsExpected('<bpmn:dataInputAssociation>');
    assertDownloadedXmlContainsExpected('<bpmn:targetRef>din_');
    assertDownloadedXmlContainsExpected('<bpmn:assignment>');
    assertDownloadedXmlContainsExpected('<bpmn:from>test.value</bpmn:from>');
    assertDownloadedXmlContainsExpected('<bpmn:to>test.value</bpmn:to>');
    assertDownloadedXmlContainsExpected('<bpmn:inputSet>');
    assertDownloadedXmlContainsExpected('<bpmn:dataInputRefs>din_');
    assertDownloadedXmlContainsExpected('<bpmn:messageEventDefinition messageRef="node_3_message" />');
  });
});
