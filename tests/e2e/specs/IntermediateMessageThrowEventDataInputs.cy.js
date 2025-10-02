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
    cy.get('[data-cy="data-input-add-id"]').clear().type('din_user_info');

    // Wait for validation to pass
    cy.get('[data-cy="data-input-save"]').should('not.be.disabled');

    // Add assignment expressions
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('user.fullname', { force: true, parseSpecialCharSequences: false });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('user.email', { force: true });

    // Save the data input
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify the data input appears in the list
    cy.get('.data-input-item').should('contain', 'User Information');
    cy.get('.data-input-item').should('contain', 'din_user_info');

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
    cy.get('[data-cy="data-input-add-id"]').clear().type('din_initial');
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
    cy.get('[data-cy="data-input-add-id"]').clear().type('din_updated');

    // Wait for validation to pass
    cy.get('[data-cy="data-input-save"]').should('not.be.disabled');
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Wait for UI to update
    cy.wait(1000);

    // Verify the updated data input
    cy.get('.data-input-item').should('contain', 'Updated Name');
    cy.get('.data-input-item').should('contain', 'din_updated');
  });

  it('should delete a data input', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Add a data input
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('To Delete');
    cy.get('[data-cy="data-input-add-id"]').clear().type('din_to_delete');
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

    // Check initial state - save button should be disabled (no name, but ID has default value)
    cy.get('[data-cy="data-input-save"]').should('be.disabled');

    // Add name - should now be enabled (has both name and valid ID)
    cy.get('[data-cy="data-input-add-name"]').type('Test Name');
    cy.get('[data-cy="data-input-save"]').should('not.be.disabled');

    // Clear ID and add invalid ID - should be disabled (invalid ID format)
    cy.get('[data-cy="data-input-add-id"]').clear().type('123-invalid');
    cy.get('[data-cy="data-input-save"]').should('be.disabled');

    // Add valid ID - should now be enabled
    cy.get('[data-cy="data-input-add-id"]').clear().type('din_valid');
    cy.get('[data-cy="data-input-save"]').should('not.be.disabled');
  });

  it('should persist data inputs after save and reload', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Add data input with assignments
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('Persistent Data');
    cy.get('[data-cy="data-input-add-id"]').clear().type('din_persistent');

    // Add assignment
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('persistent.value', { force: true, parseSpecialCharSequences: false });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('persistent.value', { force: true });

    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify data input exists
    cy.get('.data-input-item').should('contain', 'Persistent Data');

    // Click away and back to trigger save
    cy.get('[aria-label="Toolbar"]').click();
    getElementAtPosition(intermediateMessageThrowEventPosition).click();

    // Verify data input still exists after reload
    cy.get('.data-input-item').should('contain', 'Persistent Data');
    cy.get('.data-input-item').should('contain', 'din_persistent');

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
    cy.get('[data-cy="data-input-add-id"]').clear().type('din_user');
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('user', { force: true, parseSpecialCharSequences: false });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('user', { force: true });
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Add second data input
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('Order Data');
    cy.get('[data-cy="data-input-add-id"]').clear().type('din_order');
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('order', { force: true, parseSpecialCharSequences: false });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('order', { force: true });
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify both data inputs exist
    cy.get('.data-input-item').should('have.length', 2);
    cy.get('.data-input-item').first().should('contain', 'User Data');
    cy.get('.data-input-item').last().should('contain', 'Order Data');
  });

  it('should generate correct BPMN XML with data inputs and assignments', () => {
    addNodeTypeToPaper(intermediateMessageThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-message-throw-event');
    getElementAtPosition(intermediateMessageThrowEventPosition).click();
    waitToRenderAllShapes();

    // Add data input with assignments
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('Test Input');
    cy.get('[data-cy="data-input-add-id"]').clear().type('din_test');
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('test.value', { force: true, parseSpecialCharSequences: false });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('test.value', { force: true });
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify BPMN XML contains the expected elements
    assertDownloadedXmlContainsExpected(`
      <bpmn:intermediateThrowEvent id="node_3" name="Intermediate Message Throw Event">
        <bpmn:dataInput id="din_test" name="Test Input" />
        <bpmn:dataInputAssociation>
          <bpmn:targetRef>din_test</bpmn:targetRef>
          <bpmn:assignment>
            <bpmn:from>test.value</bpmn:from>
            <bpmn:to>test.value</bpmn:to>
          </bpmn:assignment>
        </bpmn:dataInputAssociation>
        <bpmn:inputSet>
          <bpmn:dataInputRefs>din_test</bpmn:dataInputRefs>
        </bpmn:inputSet>
        <bpmn:messageEventDefinition messageRef="node_3_message" />
      </bpmn:intermediateThrowEvent>
    `);
  });
});
