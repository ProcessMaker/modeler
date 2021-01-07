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
import { waitToRenderAllShapes } from './utils';

Cypress.Commands.add('loadModeler', () => {
  const url = Cypress.env('inProcessmaker')
    ? '/modeler/1'
    : '/';

  cy.viewport(defaultViewportDimensions.width, defaultViewportDimensions.height);
  cy.visit(url);
  cy.reload();
  waitToRenderAllShapes();
});

Cypress.Commands.add('moveTo', {
  prevSubject: 'element',
}, (element, x, y) => {
  cy.window()
    .its('store.state.paper')
    .then(paper => {
      const paperOrigin = paper.localToPagePoint(0, 0);

      cy.wrap(element)
        .trigger('mousedown')
        .trigger('mousemove', {
          clientX: paperOrigin.x + x,
          clientY: paperOrigin.y + y,
        })
        .trigger('mouseup');
    });
});

Cypress.Commands.add('getPosition', {
  prevSubject: 'element',
}, element => {
  cy.window()
    .its('store.state.paper')
    .then(paper => {
      const paperOrigin = paper.localToPagePoint(0, 0);
      const { left, top } = element.position();
      const { x, y } = element[0].getBBox();

      return {
        x: left - paperOrigin.x - x,
        y: top - paperOrigin.y - y,
      };
    });
});

Cypress.Commands.add('getType', {
  prevSubject: 'element',
}, element => {
  cy.window()
    .its('store.state.paper')
    .invoke('getModelById', element.attr('model-id'))
    .then(shape => shape.component.node.type);
});

Cypress.Commands.add('selectOption', { prevSubject: true }, (subject, option) => {
  cy.get(subject).click();
  cy.get(subject).find('input').clear().type(option);
  cy.get(subject).find(`span:not(.multiselect__option--disabled) span:contains("${option}"):first`).click();
  cy.wait(300);
});
