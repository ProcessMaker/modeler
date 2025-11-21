import {
  clickAndDropElement,
  getElementAtPosition,
  toggleInspector,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../../support/utils';

import { nodeTypes } from '../../support/constants';

describe('Conditional Redirect Tasks', () => {
  const taskPosition = { x: 350, y: 250 };
  const testString = 'Conditional Redirect';

  beforeEach(() => {
    toggleInspector();
  });

  it('Update task name', () => {
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Update task conditional redirect', () => {
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).click();

    // Enable conditional redirect
    cy.get('[data-test=conditional-toggle]').click({ force: true });
    cy.get('[data-test=conditional-add-button]').should('be.visible');

    // Add condition default empty
    cy.get('[data-test=conditional-add-button]').click();
    cy.get('[data-test=conditional-box]').should('be.visible');
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 1);

    // Conditional Redirect - Task Source (Default)
    cy.get('[data-test=conditional-box] .task-destination').eq(0).within(() => {
      cy.get('[data-test=conditional-task-condition]').type('score > 80');
      cy.get('[data-test=conditional-task-redirect]').click();

      cy.get('.multiselect__content-wrapper').should('be.visible');
      cy.get('.multiselect__option').contains('Task Source').click();

      cy.get('[class=multiselect__single]').should('exist');
      cy.get('[class=multiselect__single]').should('contain', 'Task Source');
      cy.get('[data-test=conditional-task-condition]').should('have.value', 'score > 80');
    });

    // Conditional Redirect - Task List
    cy.get('[data-test=conditional-add-button]').click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 2);

    cy.get('[data-test=conditional-box] .task-destination').eq(1).within(() => {
      cy.get('[data-test=conditional-task-condition]').type('score < 80');
      cy.get('[data-test=conditional-task-redirect]').click();

      cy.get('.multiselect__content-wrapper').should('be.visible');
      cy.get('.multiselect__option').contains('Task List').click();

      cy.get('[class=multiselect__single]').should('exist');
      cy.get('[class=multiselect__single]').should('contain', 'Task List');
      cy.get('[data-test=conditional-task-condition]').should('have.value', 'score < 80');
    });

    // Conditional Redirect - Process Launchpad
    cy.get('[data-test=conditional-add-button]').click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 3);

    cy.get('[data-test=conditional-box] .task-destination').eq(2).within(() => {
      cy.get('[data-test=conditional-task-condition]').type('score == 80');
      cy.get('[data-test=conditional-task-redirect]').click();

      cy.get('.multiselect__content-wrapper').should('be.visible');
      cy.get('.multiselect__option').contains('Process Launchpad').click();

      cy.get('[class=multiselect__single]').should('exist');
      cy.get('[class=multiselect__single]').should('contain', 'Process Launchpad');
      cy.get('[data-test=conditional-task-condition]').should('have.value', 'score == 80');
    });

    // Conditional Redirect - Home Page
    cy.get('[data-test=conditional-add-button]').click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 4);

    cy.get('[data-test=conditional-box] .task-destination').eq(3).within(() => {
      cy.get('[data-test=conditional-task-condition]').type('amount > 1000');
      cy.get('[data-test=conditional-task-redirect]').click();

      cy.get('.multiselect__content-wrapper').should('be.visible');
      cy.get('.multiselect__option').contains('Home Page').click();

      cy.get('[class=multiselect__single]').should('exist');
      cy.get('[class=multiselect__single]').should('contain', 'Home Page');
      cy.get('[data-test=conditional-task-condition]').should('have.value', 'amount > 1000');
    });

    // Conditional Redirect - Custom Dashboard
    cy.get('[data-test=conditional-add-button]').click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 5);

    cy.get('[data-test=conditional-box] .task-destination').eq(4).within(() => {
      cy.get('[data-test=conditional-task-condition]').type('amount == 1000');
      cy.get('[data-test=conditional-task-redirect]').click();

      cy.get('.multiselect__content-wrapper').should('be.visible');
      cy.get('.multiselect__option').contains('Custom Dashboard').click();

      cy.get('[class=multiselect__single]').should('exist');
      cy.get('[class=multiselect__single]').should('contain', 'Custom Dashboard');
      cy.get('[data-test=conditional-task-condition]').should('have.value', 'amount == 1000');
    });

    // Conditional Redirect - External URL
    cy.get('[data-test=conditional-add-button]').click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 6);

    cy.get('[data-test=conditional-box] .task-destination').eq(5).within(() => {
      cy.get('[data-test=conditional-task-condition]').type('amount < 1000');
      cy.get('[data-test=conditional-task-redirect]').click();

      cy.get('.multiselect__content-wrapper').should('be.visible');
      cy.get('.multiselect__option').contains('External URL').click();

      cy.get('[class=multiselect__single]').should('exist');
      cy.get('[class=multiselect__single]').should('contain', 'External URL');
      cy.get('[data-test=conditional-task-condition]').should('have.value', 'amount < 1000');

      cy.get('[data-test=conditional-task-external-url]').type('https://github.com');
      cy.get('[data-test=conditional-task-external-url]').should('have.value', 'https://github.com');
    });

    // Conditional Redirect - Display Next Assigned Task
    cy.get('[data-test=conditional-add-button]').click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 7);

    cy.get('[data-test=conditional-box] .task-destination').eq(6).within(() => {
      cy.get('[data-test=conditional-task-condition]').type('amount == 1000');
      cy.get('[data-test=conditional-task-redirect]').click();

      cy.get('.multiselect__content-wrapper').should('be.visible');
      cy.get('.multiselect__option').contains('Display Next Assigned Task').click();

      cy.get('[class=multiselect__single]').should('exist');
      cy.get('[class=multiselect__single]').should('contain', 'Display Next Assigned Task');
      cy.get('[data-test=conditional-task-condition]').should('have.value', 'amount == 1000');
    });
  });

  it('Max conditions reached', () => {
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).click();

    // Enable conditional redirect
    cy.get('[data-test=conditional-toggle]').click({ force: true });
    cy.get('[data-test=conditional-add-button]').should('be.visible');

    const conditionalAddButtonDataTest = '[data-test=conditional-add-button]';

    cy.get(conditionalAddButtonDataTest).click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 1);

    // Add condition default empty
    cy.get(conditionalAddButtonDataTest).click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 2);

    // Add condition default empty
    cy.get(conditionalAddButtonDataTest).click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 3);

    // Add condition default empty
    cy.get(conditionalAddButtonDataTest).click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 4);

    // Add condition default empty
    cy.get(conditionalAddButtonDataTest).click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 5);

    // Add condition default empty
    cy.get(conditionalAddButtonDataTest).click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 6);

    // Add condition default empty
    cy.get(conditionalAddButtonDataTest).click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 7);

    // Add condition default empty
    cy.get(conditionalAddButtonDataTest).click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 8);

    // Add condition default empty
    cy.get(conditionalAddButtonDataTest).click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 9);

    // Add condition default empty
    cy.get(conditionalAddButtonDataTest).click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 10);

    cy.get(conditionalAddButtonDataTest).should('be.disabled');
  });

  it('Duplicate condition', () => {
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).click();

    // Enable conditional redirect
    cy.get('[data-test=conditional-toggle]').click({ force: true });
    cy.get('[data-test=conditional-add-button]').should('be.visible');

    // Add condition default empty
    cy.get('[data-test=conditional-add-button]').click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 1);

    cy.get('[data-test=conditional-box] .task-destination').first().within(() => {
      cy.get('[data-test=conditional-task-condition]').type('score == 80');
      cy.get('[data-test=conditional-task-redirect]').click();

      cy.get('.multiselect__content-wrapper').should('be.visible');
      cy.get('.multiselect__option').contains('Process Launchpad').click();

      cy.get('[class=multiselect__single]').should('exist');
      cy.get('[class=multiselect__single]').should('contain', 'Process Launchpad');
      cy.get('[data-test=conditional-task-condition]').should('have.value', 'score == 80');
    });

    // Duplicate condition
    cy.get('[data-test=conditional-box] .task-destination').eq(0).within(() => {
      cy.get('[data-test=conditional-duplicate-button]').click();
    });

    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 2);

    cy.get('[data-test=conditional-box] .task-destination').last().within(() => {
      cy.get('[data-test=conditional-task-condition]').should('have.value', 'score == 80');
      cy.get('[class=multiselect__single]').should('contain', 'Process Launchpad');
    });
  });

  it('Remove condition', () => {
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).click();

    // Enable conditional redirect
    cy.get('[data-test=conditional-toggle]').click({ force: true });
    cy.get('[data-test=conditional-add-button]').should('be.visible');

    // Add condition default empty
    cy.get('[data-test=conditional-add-button]').click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 1);

    cy.get('[data-test=conditional-add-button]').click();
    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 2);

    cy.get('[data-test=conditional-box] .task-destination').last().within(() => {
      cy.get('[data-test=conditional-remove-button]').click();
    });

    cy.get('[data-test=conditional-box] .task-destination').should('have.length', 1);
  });

});
