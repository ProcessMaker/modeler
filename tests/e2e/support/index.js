// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import '@cypress/code-coverage/support';
import { dragFromSourceToDest, waitToRenderAllShapes } from './utils';
import { nodeTypes } from './constants';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Disable saving screenshots
Cypress.Screenshot.defaults({ screenshotOnRunFailure: false });

Cypress.Cookies.defaults({
  preserve: ['processmaker_session', /remember_web_.*/],
});

Cypress.on('scrolled', $el => {
  $el.get(0).scrollIntoView({
    block: 'center',
    inline: 'center',
  });
});

beforeEach(() => {
  cy.loadModeler();
  dragFromSourceToDest(nodeTypes.startEvent, { x: 150, y: 150 });
  waitToRenderAllShapes();
  cy.get('.paper-container').click();
});

require('./printLogsToTerminal');
