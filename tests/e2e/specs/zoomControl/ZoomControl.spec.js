describe('Zoom control test', () => {
  const zoomOutSelector = '[data-cy="zoom-out-control"]';
  const zoomInSelector = '[data-cy="zoom-in-control"]';

  const buttonBgColorDefault = 'rgb(255, 255, 255)';
  const iconFillColorDefault = 'rgb(51, 51, 68)';

  const initialScale = 1;
  const scaleStep = 0.1;
  const numZoomOutTimes = 3;
  const numZoomInTimes = 8;

  it('should render new zoom-out control', () => {
    cy.get(zoomOutSelector)
      .should('be.visible')
      .then($btn => {
        // Checks button style
        expect($btn).to.have.css('background-color', buttonBgColorDefault);

        // Checks button icon style
        const icon = $btn.children('svg');
        expect(icon).to.have.css('fill', iconFillColorDefault);
      });
  });

  it('should render new zoom-in control', () => {
    cy.get(zoomInSelector)
      .should('be.visible')
      .then($btn => {
        // Checks button style
        expect($btn).to.have.css('background-color', buttonBgColorDefault);

        // Checks button icon style
        const icon = $btn.children('svg');
        expect(icon).to.have.css('fill', iconFillColorDefault);
      });
  });

  it(`should update modeler according (-) zoom-out (${numZoomOutTimes}) times`, () => {
    const numClicks = Array.from({length: numZoomOutTimes}, (_, index) => index + 1);

    numClicks.forEach(() => {
      cy.get(zoomOutSelector).click();
    });

    cy.window()
      .its('store.state.paper')
      .then(paper => {
        const expectedScale = initialScale - (scaleStep * numZoomOutTimes);

        cy.wait(500);

        expect(expectedScale).eq(Math.round(paper.scale().sx * 10) / 10);
        expect(expectedScale).eq(Math.round(paper.scale().sy * 10) / 10);
      });
  });

  it(`should update modeler according (+) zoom-in (${numZoomInTimes}) times`, () => {
    const numClicks = Array.from({length: numZoomInTimes}, (_, index) => index + 1);

    numClicks.forEach(() => {
      cy.get(zoomInSelector).click();
    });

    cy.window()
      .its('store.state.paper')
      .then(paper => {
        const expectedScale = initialScale + (scaleStep * numZoomInTimes);

        cy.wait(500);

        expect(expectedScale).eq(Math.round(paper.scale().sx * 10) / 10);
        expect(expectedScale).eq(Math.round(paper.scale().sy * 10) / 10);
      });
  });
});
