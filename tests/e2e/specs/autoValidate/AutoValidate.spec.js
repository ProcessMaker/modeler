describe('Auto Validate test', { scrollBehavior: false }, () => {
  const validateButtonSelector = '[data-cy="validate-button"]';

  it('should render new auto validate control', () => {
    cy.get(validateButtonSelector)
      .should('be.visible')
      .then($btn => {
        // Checks button style
        expect($btn).to.have.css('background-color', 'rgb(235, 238, 242)');

        // Checks button icon style
        const icon = $btn.children('svg');
        expect(icon).to.have.css('fill', 'rgb(33, 37, 41)');
      });
  });
});
