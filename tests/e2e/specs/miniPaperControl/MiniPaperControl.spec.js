import { waitToRenderAllShapes } from '../../support/utils';

describe.skip('Mini Paper control test', { scrollBehavior: false }, () => {
  const miniPaperSelector = '[data-cy="mini-paper-button"]';
  const miniMapSelector = '[data-cy="mini-map-box"]';

  const positions = [
    {
      offsetX: 28,
      offsetY: 30,
    },
    {
      offsetX: 98,
      offsetY: 140,
    },
    {
      offsetX: 40,
      offsetY: 60,
    },
  ];

  it('should render new mini-paper button', () => {
    waitToRenderAllShapes();

    cy.get(miniPaperSelector)
      .should('be.visible')
      .then(($btn) => {
        // Checks button style
        expect($btn).to.have.css('background-color', 'rgb(255, 255, 255)');

        // Checks button icon style
        const icon = $btn.children('svg');
        expect(icon).to.have.css('fill', 'rgb(51, 51, 68)');

        // Checks if mini-map is closed
        cy.get(miniMapSelector).should('have.class', 'closed');
      });
  });

  it('should show mini-map', () => {
    waitToRenderAllShapes();

    cy.get(miniPaperSelector)
      .should('be.visible')
      .click()
      .then(($btn) => {
        // Checks button active style
        expect($btn).to.have.css('background-color', 'rgb(222, 235, 255)');

        // Checks if button icon active style
        const icon = $btn.children('svg');
        expect(icon).to.have.css('fill', 'rgb(18, 100, 170)');

        // Checks if mini-map is open
        cy.get(miniMapSelector)
          .should('have.class', 'opened');
      });
  });

  positions.forEach(position => {
    it(`should update the paper according the mini-paper control (${position.offsetX} - ${position.offsetY}) selection`, () => {
      waitToRenderAllShapes();

      cy.get(miniPaperSelector)
        .should('be.visible')
        .click()
        .then(() => {
          // Checks if mini-map is open
          cy.get(miniMapSelector)
            .should('have.class', 'opened')
            .click(position.offsetX, position.offsetY)
            .then(() => {
              // Checks if the new coordinates are the correct ones
              cy.window().then(win => {
                expect(win.MiniPaper.newX).to.equal(win.store.state.paper.localToPaperPoint().x);
                expect(win.MiniPaper.newY).to.equal(win.store.state.paper.localToPaperPoint().y);
              });
            });
        });
    });
  });
});
