describe.skip('Publish control test', { scrollBehavior: false }, () => {
  it('should render new publish control', () => {
    cy.get('[data-cy="publish-control"]')
      .should('not.be.visible')
      .and('have.css', 'width', '0px')
      .and('have.css', 'height', '32px');
  });

  it('should get isVersionsInstalled value from store and update it', () => {
    cy.window()
      .its('undoRedoStore')
      .then(store => {
        expect(store.state.isVersionsInstalled).to.equal(false);

        store.dispatch('enableVersions');

        expect(store.state.isVersionsInstalled).to.equal(true);
      });
  });

  it('should render new publish version status', () => {
    cy.window()
      .its('undoRedoStore')
      .then(store => {
        store.dispatch('enableVersions');

        expect(store.state.isVersionsInstalled).to.equal(true);

        cy.get('[data-cy="publish-version-status"]')
          .should('be.visible')
          .then($el =>  {
            expect($el).to.have.css('font-size', '14px');
            expect($el).to.have.css('font-weight', '600');
            expect($el).to.have.css('color', 'rgb(108, 117, 125)');
            expect($el).to.have.css('border-left', '1px solid rgb(173, 179, 184)');
          });
      });
  });

  it('should render new publish loading status', () => {
    cy.window()
      .its('undoRedoStore')
      .then(store => {
        store.dispatch('enableVersions');

        expect(store.state.isVersionsInstalled).to.equal(true);

        cy.get('[data-cy="publish-loading-status"]')
          .should('be.visible')
          .then($el => {
            expect($el).to.have.css('font-size', '14px');
            expect($el).to.have.css('font-weight', '400');
            expect($el).to.have.css('color', 'rgb(0, 0, 0)');
          });
      });
  });

  it('should render new publish button', () => {
    cy.window()
      .its('undoRedoStore')
      .then(store => {
        store.dispatch('enableVersions');

        expect(store.state.isVersionsInstalled).to.equal(true);

        cy.get('[data-cy="publish-btn"]')
          .then($el => {
            expect($el).to.be.visible;
            expect($el.text().trim().toLowerCase()).to.equal('publish');

            expect($el).to.have.css('width', '72px');
            expect($el).to.have.css('height', '30px');
            expect($el).to.have.css('background-color', 'rgb(21, 114, 194)');
          });
      });
  });

  it('should render new close button', () => {
    cy.window()
      .its('undoRedoStore')
      .then(store => {
        store.dispatch('enableVersions');

        expect(store.state.isVersionsInstalled).to.equal(true);

        cy.get('[data-cy="close-btn"]')
          .then($el => {
            expect($el).to.be.visible;
            expect($el.text().trim().toLowerCase()).to.equal('close');

            expect($el).to.have.css('width', '42px');
            expect($el).to.have.css('height', '22px');
            expect($el).to.have.css('color', 'rgb(0, 0, 0)');
          });
      });
  });

  it('should not render Ellipsis Menu', () => {
    cy.window()
      .its('undoRedoStore')
      .then(store => {
        store.dispatch('enableVersions');

        expect(store.state.isVersionsInstalled).to.equal(true);

        cy.get('[data-cy="ellipsis-menu"]')
          .should('not.be.visible');
      });
  });
});
