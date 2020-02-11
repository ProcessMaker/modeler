/* This file allows console.log's to be displayed in the terminal to help with debugging
 * tests run on the CI. See https://github.com/cypress-io/cypress/issues/3199#issuecomment-466593084. */

let logs = [];

Cypress.on('window:before:load', window => {
  const docIframe = window.parent.document.getElementById('Your App: \'modeler\'');

  if (!docIframe) {
    return;
  }

  const appWindow = docIframe.contentWindow;

  ['log', 'info', 'error', 'warn', 'debug'].forEach(consoleMethod => {
    appWindow.console[consoleMethod] = function(...args) {
      logs.push(args.join(' '));
    };
  });
});

Cypress.mocha.getRunner().on('test', () => {
  logs = [];
});

Cypress.on('fail', error => {
  error.stack += '\n\nConsole Logs:\n=============\n';
  error.stack += logs.join('\n');

  logs = [];

  throw error;
});
