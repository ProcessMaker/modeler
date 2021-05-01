import {
  addNodeTypeToPaper,
  waitToRenderAllShapes,
  selectOptionByName,
  getElementAtPosition
} from '../support/utils';
import { nodeTypes } from '../support/constants';
import _ from 'lodash';

const intermediateSignalThrowEventPosition = { x: 250, y: 250 };

function setPerm(perm, value) {
  cy.get('[data-test="paper"]').click();
  cy.window().then((win) => {
    _.set(win, 'ProcessMaker.modeler.signalPermissions.' + perm, value);
  });
  return getElementAtPosition(intermediateSignalThrowEventPosition).click();
}

Cypress.on('window:load', (win) => {
    console.log("-------------- HERE", win.ProcessMaker);
    win.console.log = console.log;
});

describe('Intermediate Message Throw Event', () => {

  it('can create a message when intermediate message throw event is dragged on', () => {
    
    cy.window().then(win => {
      cy.stub(win.ProcessMaker, 'alert').as('alert');
    })
    
    addNodeTypeToPaper(intermediateSignalThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-signal-throw-event');
    waitToRenderAllShapes();

    cy.get('[data-test="signalRef:select"]').should('have.class', 'multiselect--disabled');

    setPerm('view-signals', true);
    cy.get('[data-cy="events-list"').click();
    cy.get('[data-cy="events-add"').click();

    cy.get('@alert').should('be.calledWith', "You do not have permission to add new signals", "danger");
    
    setPerm('create-signals', true);
    cy.get('[data-cy="events-list"').click();
    cy.get('[data-cy="events-add"').click();
    cy.get('[data-cy="events-add-id"]').should('be.visible');
    cy.get('[data-cy="events-cancel"').click();

    selectOptionByName('[data-test="signalRef:select"]', 'global signal 1');
    
    cy.get('.badge-secondary').contains('global_1').should('be.visible');
    cy.get('[data-cy="events-edit"]').should('not.exist');
    cy.get('[data-cy="events-remove"]').should('not.exist');

  });
});
