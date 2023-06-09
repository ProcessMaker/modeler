import { nodeTypes } from '../../support/constants';
import {
  dragFromSourceToDest,
  // waitToRenderAllShapes,
  // getGraphElements,
  // getElementAtPosition,
  // getCrownButtonForElement,
  // getLinksConnectedToElement,
  // testNumberOfVertices,
  // connectNodesWithFlow,
  // setBoundaryEvent,
} from '../../support/utils';

describe('Auto Validate test', { scrollBehavior: false }, () => {
  const validateButtonSelector = '[data-cy="validate-button"]';
  const validateButtonIssueSelector = '[data-cy="validate-issue-button"]';
  const validatePanelSelector = '[data-cy="validate-panel"]';

  const buttonBgColorDefault = 'rgb(235, 238, 242)';
  const iconFillColorDefault = 'rgb(33, 37, 41)';
  const buttonBgColorActive = 'rgb(16, 74, 117)';

  const defaultNumberOfErrors = 2;

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
    cy.get(validateButtonSelector).click()
      .then(() => {
        cy.get(validateButtonSelector).should('have.css', 'background-color', buttonBgColorActive);

        cy.get(validateButtonIssueSelector).should('be.visible');
        cy.get(validatePanelSelector).should('not.be.visible');

        cy.window().then(win => {
          // Checks default number of errors when clicks on validate button
          expect(win.TopRail.numberOfErrors).to.equal(defaultNumberOfErrors);
        });
      });
  });

  it('should render new validate panel', () => {
    cy.get(validateButtonSelector).click()
      .then(() => {
        cy.get(validateButtonIssueSelector).should('be.visible');
        cy.get(validatePanelSelector).should('not.be.visible');
      });

    cy.get(validateButtonIssueSelector).click()
      .then(() => {
        cy.window().then(win => {
          // Checks default number of errors when clicks on validate button
          expect(win.TopRail.numberOfErrors).to.equal(defaultNumberOfErrors);
        });

        // Checks default message errors when clicks on validate issue button
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

    cy.get(validateButtonIssueSelector).click()
      .then(() => {
        cy.window().then(win => {
          // Checks default number of errors when clicks on validate button
          expect(win.TopRail.numberOfErrors).to.equal(defaultNumberOfErrors);
        });

        // Checks default message errors when clicks on validate issue button
        cy.get(validatePanelSelector)
          .should('be.visible')
          .then(($panel => {
            expect($panel.children()).to.have.length(defaultNumberOfErrors);
          }));
      });

    // Add a form task control
    const taskPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    const currentNumberOfErrorsWithTask = defaultNumberOfErrors + 1;

    cy.window().then(win => {
      // Checks default number of errors when clicks on validate button
      expect(win.TopRail.numberOfErrors).to.equal(currentNumberOfErrorsWithTask);
    });

    cy.get(validatePanelSelector)
      .should('be.visible')
      .then(($panel => {
        expect($panel.children()).to.have.length(currentNumberOfErrorsWithTask);
      }));

    // Add a inclusive gateway control
    const gatewayPosition = { x: 450, y: 450 };
    dragFromSourceToDest(nodeTypes.exclusiveGateway, gatewayPosition, nodeTypes.inclusiveGateway);
    const currentNumberOfErrorsWithGateway = defaultNumberOfErrors + 3;

    cy.window().then(win => {
      // Checks default number of errors when clicks on validate button
      expect(win.TopRail.numberOfErrors).to.equal(currentNumberOfErrorsWithGateway);
    });

    cy.get(validatePanelSelector)
      .should('be.visible')
      .then(($panel => {
        expect($panel.children()).to.have.length(currentNumberOfErrorsWithGateway);
      }));
  });
});
