// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import { defaultViewportDimensions } from './constants';

Cypress.Commands.add('loadModeler', () => {
  cy.viewport(defaultViewportDimensions.width, defaultViewportDimensions.height);
  cy.visit('/');
  cy.reload();
});

Cypress.Commands.add('moveTo', {
  prevSubject: true,
}, (element, x, y) => {
  console.log(element, x, y);
  element.trigger('mousedown', { which: 1 })
    .trigger('mousemove', { x, y })
    .trigger('mouseup', { force: true });
});