
describe('Bottom Controls layout', () => {
  it('Verify if bottom rail is well formed', () => {
    cy.get('[data-cy="rail-bottom"]').should(($div) => {
      expect($div).to.have.length(1);
      const className = $div[0].className;
      
      expect(className).to.match(/rail-container/);
      const children = $div[0].children;
      expect(children).to.have.length(2);
      const firstChildClassName = children[0].className;
      expect(firstChildClassName).to.match(/rail-left/);
      const secondChildClassName = children[1].className;
      expect(secondChildClassName).to.match(/rail-center/);
    });
  });
  it('Verify if left bottom rail is well formed', () => {
    cy.get('[data-cy="rail-bottom"] [class="rail-left"]').should(($div) => {
      expect($div).to.have.length(1);
      const children = $div[0].children;
      expect(children).to.have.length(2);
      const firstChildClassName = children[0].className;
      expect(firstChildClassName).to.match(/mini-paper-box/);
      const secondChildClassName = children[1].className;
      expect(secondChildClassName).to.match(/zoom-box/);
    });
  });
  it('Verify if center bottom rail is well formed', () => {
    cy.get('[data-cy="rail-bottom"] [class="rail-center"]').should(($div) => {
      expect($div).to.have.length(1);
      const children = $div[0].children;
      expect(children).to.have.length(2);
      const firstChildClassName = children[0].className;
      expect(firstChildClassName).to.match(/ur-box/);
      const secondChildClassName = children[1].className;
      expect(secondChildClassName).to.match(/control-list/);
    });
  });
});