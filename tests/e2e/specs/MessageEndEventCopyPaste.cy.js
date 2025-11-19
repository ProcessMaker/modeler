import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  getElementAtPosition,
  toggleInspector,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

const messageEndEventPosition = { x: 350, y: 200 };

describe('Message End Event Copy Paste', { scrollBehavior: false }, () => {
  beforeEach(() => {
    toggleInspector();
  });

  it('should copy and paste message end event with data inputs and assignments', () => {
    // Add initial message end event
    addNodeTypeToPaper(messageEndEventPosition, nodeTypes.endEvent, 'switch-to-message-end-event');
    getElementAtPosition(messageEndEventPosition).click();
    waitToRenderAllShapes();

    // Add data input with assignments
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('Test Data Input');
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('user.name', { force: true });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('data.name', { force: true });
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify data input exists
    cy.get('.data-input-item').should('contain', 'Test Data Input');
    cy.get('.data-input-item').should('contain', 'user.name');
    cy.get('.data-input-item').should('contain', 'data.name');

    // Copy the element
    cy.get('[data-test="copy-button"]').click();

    // Click on empty space to deselect
    cy.get('.paper-container').click('center', { force: true });

    // Paste the element
    cy.get('body').type('{ctrl}v');

    // Wait for paste to complete
    cy.get('[role="alert"]', { timeout: 7000 }).should('not.exist');

    // Click on the pasted element (should be the second message end event)
    cy.get('[data-type="processmaker.components.nodes.endEvent.Shape"]').eq(1).click({ force: true });

    // Verify the pasted element has the data inputs
    cy.get('.data-input-item').should('contain', 'Test Data Input');
    cy.get('.data-input-item').should('contain', 'user.name');
    cy.get('.data-input-item').should('contain', 'data.name');

    // Verify BPMN XML contains the expected elements for both elements
    assertDownloadedXmlContainsExpected('<bpmn:endEvent id="node_3" name="Message End Event">');
    assertDownloadedXmlContainsExpected('<bpmn:endEvent id="node_4" name="Message End Event">');
    assertDownloadedXmlContainsExpected('<bpmn:dataInput id="din_');
    assertDownloadedXmlContainsExpected('name="Test Data Input"');
    assertDownloadedXmlContainsExpected('<bpmn:dataInputAssociation>');
    assertDownloadedXmlContainsExpected('<bpmn:assignment>');
    assertDownloadedXmlContainsExpected('<bpmn:from>user.name</bpmn:from>');
    assertDownloadedXmlContainsExpected('<bpmn:to>data.name</bpmn:to>');
  });

  it('should copy and paste message end event with multiple data inputs', () => {
    // Add initial message end event
    addNodeTypeToPaper(messageEndEventPosition, nodeTypes.endEvent, 'switch-to-message-end-event');
    getElementAtPosition(messageEndEventPosition).click();
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

    // Copy the element
    cy.get('[data-test="copy-button"]').click();

    // Click on empty space to deselect
    cy.get('.paper-container').click('center', { force: true });

    // Paste the element
    cy.get('body').type('{ctrl}v');

    // Wait for paste to complete
    cy.get('[role="alert"]', { timeout: 7000 }).should('not.exist');

    // Click on the pasted element (should be the second message end event)
    cy.get('[data-type="processmaker.components.nodes.endEvent.Shape"]').eq(1).click({ force: true });

    // Verify the pasted element has both data inputs
    cy.get('.data-input-item').should('have.length', 2);
    cy.get('.data-input-item').first().should('contain', 'User Data');
    cy.get('.data-input-item').last().should('contain', 'Order Data');
  });

  it('should copy and paste message end event with complex assignment expressions', () => {
    // Add initial message end event
    addNodeTypeToPaper(messageEndEventPosition, nodeTypes.endEvent, 'switch-to-message-end-event');
    getElementAtPosition(messageEndEventPosition).click();
    waitToRenderAllShapes();

    // Add data input with complex expressions
    cy.get('[data-cy="add-data-input"]').click();
    cy.get('[data-cy="data-input-add-name"]').type('Complex Data');
    cy.get('[data-cy="add-assignment"]').click({ force: true });
    cy.get('textarea[placeholder*="firstname"]').first().type('{$data["user"]["firstName"]} {$data["user"]["lastName"]}', { force: true, parseSpecialCharSequences: false });
    cy.get('textarea[placeholder*="user.firstname"]').first().type('fullName', { force: true });
    cy.get('[data-cy="data-input-save"]').click({ force: true });

    // Verify complex expression exists
    cy.get('.data-input-item').should('contain', 'Complex Data');
    cy.get('.data-input-item').should('contain', '{$data["user"]["firstName"]} {$data["user"]["lastName"]}');
    cy.get('.data-input-item').should('contain', 'fullName');

    // Copy the element
    cy.get('[data-test="copy-button"]').click();

    // Click on empty space to deselect
    cy.get('.paper-container').click('center', { force: true });

    // Paste the element
    cy.get('body').type('{ctrl}v');

    // Wait for paste to complete
    cy.get('[role="alert"]', { timeout: 7000 }).should('not.exist');

    // Click on the pasted element (should be the second message end event)
    cy.get('[data-type="processmaker.components.nodes.endEvent.Shape"]').eq(1).click({ force: true });

    // Verify the pasted element has the complex expression
    cy.get('.data-input-item').should('contain', 'Complex Data');
    cy.get('.data-input-item').should('contain', '{$data["user"]["firstName"]} {$data["user"]["lastName"]}');
    cy.get('.data-input-item').should('contain', 'fullName');
  });
});