import { isAppleOS } from '../../../support/utils';

const key = isAppleOS() ? '{meta}' : '{ctrl}';

describe('Hotkeys', () => {
  describe('Zoom', () => {
    it('Zoom percentage increases when Ctrl + "+" is pressed', () => {
      cy.get('[aria-label="Toolbar"]').click();
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '100%');
      cy.get('body').type(`${key}+`);
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '110%');
      cy.get('body').type(`${key}+`);
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '120%');
      cy.get('body').type(`${key}+`);
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '130%');
    });

    it('Zoom percentage increases when Ctrl + "NumpadAdd" is pressed', () => {
      cy.get('[aria-label="Toolbar"]').click();
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '100%');
      cy.get('body').trigger('keydown', { key:'NumpadAdd', keyCode: 107, which: 107, ctrlKey: true });
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '110%');
      cy.get('body').trigger('keydown', { key:'NumpadAdd', keyCode: 107, which: 107, ctrlKey: true });
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '120%');
      cy.get('body').trigger('keydown', { key:'NumpadAdd', keyCode: 107, which: 107, ctrlKey: true });
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '130%');
    });
  });
  describe('Unzoom', () => {
    it('Zoom percentage decreases when Ctrl + "-" is pressed', () => {
      cy.get('[aria-label="Toolbar"]').click();
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '100%');
      cy.get('body').type(`${key}-`);
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '90%');
      cy.get('body').type(`${key}-`);
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '80%');
      cy.get('body').type(`${key}-`);
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '70%');
    });

    it('Zoom percentage increases when Ctrl + "NumpadSubstract" is pressed', () => {
      cy.get('[aria-label="Toolbar"]').click();
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '100%');
      cy.get('body').trigger('keydown', { key:'NumpadSubstract', keyCode: 109, which: 109, ctrlKey: true });
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '90%');
      cy.get('body').trigger('keydown', { key:'NumpadSubstract', keyCode: 109, which: 109, ctrlKey: true });
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '80%');
      cy.get('body').trigger('keydown', { key:'NumpadSubstract', keyCode: 109, which: 109, ctrlKey: true });
      cy.get('[data-cy="zoom-reset-control"]').should('have.text', '70%');
    });
  });
});
