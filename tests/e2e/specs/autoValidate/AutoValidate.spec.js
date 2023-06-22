import { nodeTypes } from '../../support/constants';
import { clickAndDropElement, waitToRenderAllShapes } from '../../support/utils';

describe.skip('Auto Validate test', { scrollBehavior: false }, () => {
  const validateButtonSelector = '[data-cy="validate-button"]';
  const validateButtonIssueSelector = '[data-cy="validate-issue-button"]';
  const validatePanelSelector = '[data-cy="validate-panel"]';

  const buttonBgColorDefault = 'rgb(235, 238, 242)';
  const iconFillColorDefault = 'rgb(33, 37, 41)';
  const buttonBgColorActive = 'rgb(16, 74, 117)';

  const defaultNumberOfErrors = 2;

  beforeEach(() => {
    cy.get('[data-test=processmaker-modeler-start-event] > .pinIcon').click();
    cy.get('[data-test=processmaker-modeler-task] > .pinIcon').click();
    cy.get('[data-test=processmaker-modeler-exclusive-gateway] > .pinIcon').click();

    cy.get('.control-add').click();
    waitToRenderAllShapes();
    cy.get('[data-test=explorer-rail]').should('not.exist');
    waitToRenderAllShapes();
  });

  it('should render new auto validate control', () => {
    cy.get(validateButtonSelector)
      .should('be.visible')
      .then($btn => {
        // Checks button style
        expect($btn).to.have.css('background-color', buttonBgColorDefault);

        // Checks button icon style
        const icon = $btn.children('svg');
        expect(icon).to.have.css('fill', iconFillColorDefault);
      });

    cy.get(validateButtonIssueSelector).should('not.be.visible');

    cy.get(validatePanelSelector).should('not.be.visible');
  });

  it('should render new validate issue button', () => {
    cy.get(validateButtonSelector)
      .click()
      .then(() => {
        cy.get(validateButtonSelector).should('have.css', 'background-color', buttonBgColorActive);

        cy.get(validateButtonIssueSelector)
          .should('be.visible')
          .then($btn => {
            const issueBadge = $btn.children('.issue-badge');
            expect(issueBadge).to.have.text(defaultNumberOfErrors);

          });

        cy.get(validatePanelSelector).should('not.be.visible');
      });
  });

  it('should render new validate panel', () => {
    cy.get(validateButtonSelector).click()
      .then(() => {
        cy.get(validateButtonIssueSelector).should('be.visible');
        cy.get(validatePanelSelector).should('not.be.visible');
      });

    cy.get(validateButtonIssueSelector).click();
    cy.get(validateButtonIssueSelector)
      .should('be.visible')
      .then($btn => {
        const issueBadge = $btn.children('.issue-badge');
        expect(issueBadge).to.have.text(defaultNumberOfErrors);

        cy.get(validatePanelSelector)
          .should('be.visible')
          .then(($panel => {
            expect($panel.children()).to.have.length(defaultNumberOfErrors);
          }));
      });
  });

  it('should update the validate panel when add a new control', () => {
    cy.get(validateButtonSelector).click()
      .then(() => {
        cy.get(validateButtonIssueSelector).should('be.visible');
        cy.get(validatePanelSelector).should('not.be.visible');
      });

    cy.get(validateButtonIssueSelector).click();
    cy.get(validateButtonIssueSelector)
      .should('be.visible')
      .then($btn => {
        const issueBadge = $btn.children('.issue-badge');
        expect(issueBadge).to.have.text(defaultNumberOfErrors);

        cy.get(validatePanelSelector)
          .should('be.visible')
          .then(($panel => {
            expect($panel.children()).to.have.length(defaultNumberOfErrors);
          }));
      });

    // Add a form task control
    const taskPosition = { x: 200, y: 300 };
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    const currentNumberOfErrorsWithTask = defaultNumberOfErrors + 1;

    cy.get(validateButtonIssueSelector)
      .then($btn => {
        const issueBadge = $btn.children('.issue-badge');
        expect(issueBadge).to.have.text(currentNumberOfErrorsWithTask);
      });

    cy.get(validatePanelSelector)
      .should('be.visible')
      .then(($panel => {
        expect($panel.children()).to.have.length(currentNumberOfErrorsWithTask);
      }));

    // Add a inclusive gateway control
    const gatewayPosition = { x: 200, y: 400 };
    clickAndDropElement(nodeTypes.exclusiveGateway, gatewayPosition, nodeTypes.inclusiveGateway);
    waitToRenderAllShapes();
    const currentNumberOfErrorsWithGateway = defaultNumberOfErrors + 3;

    cy.get(validateButtonIssueSelector)
      .then($btn => {
        const issueBadge = $btn.children('.issue-badge');
        expect(issueBadge).to.have.text(currentNumberOfErrorsWithGateway);
      });

    cy.get(validatePanelSelector)
      .should('be.visible')
      .then(($panel => {
        expect($panel.children()).to.have.length(currentNumberOfErrorsWithGateway);
      }));
  });
});
