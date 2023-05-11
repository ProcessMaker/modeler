// import paperManager from '../../../../../src/components/paperManager';
import {
  waitToRenderAllShapes,
} from '../../support/utils';

describe('Mini-paper control', () => {
  const miniPaperSelector = '[data-cy="mini-paper-button"]';
  const miniMapSelector = '[data-cy="mini-map-box"]';

  const positions = [
    {
      offsetX: 119,
      offsetY: 140,
      scaleX: 1,
      scaleY: 1,
      clientWidth: 1138,
      clientHeight: 845,
    },
  ];

  it('should be render new mini-paper button', () => {
    waitToRenderAllShapes();

    cy.get(miniPaperSelector)
      .should('be.visible')
      .then(($btn) => {
        // Checks button style
        expect($btn).to.have.css('background-color', 'rgb(255, 255, 255)');

        // Checks if button icon style
        const icon = $btn.children('svg');
        expect(icon).to.have.css('fill', 'rgb(51, 51, 68)');

        // Checks if mini-map is closed
        cy.get(miniMapSelector).should('have.class', 'closed');
      });
  });

  it('should be show mini-map', () => {
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
});
