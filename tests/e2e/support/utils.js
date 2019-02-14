export function getGraphElements() {
  return cy.window()
    .its('store.state.graph')
    .invoke('getCells')
    .then(cells => cells.filter(cell => cell.component));
}

export function getElementAtPosition(position) {
  /* clickOffset is used to ensure click happens inside of element;
   * clicking right at the element boundry may result in clicking
   * just outside of the element. 10 is the current paper grid size. */
  const clickOffset = 10;

  const offsetPosition = {
    x: position.x + clickOffset,
    y: position.y + clickOffset,
  };

  return cy.window()
    .its('store.state.paper')
    .invoke('findViewsFromPoint', offsetPosition)
    .then(views => views.filter(view => view.model.component))
    .then(views => views.sort((view1, view2) => {
      /* Sort shape views by z-index descending; the shape "on top" will be first in array. */
      return view2.model.get('z') - view1.model.get('z');
    }))
    .then(views => views[0])
    .then(view => view.$el);
}

export function dragFromSourceToDest(source, dest, position) {
  const dataTransfer = new DataTransfer();
  cy.get(`[data-test=${ source }]`).trigger('dragstart', { dataTransfer });
  cy.get(dest).trigger('dragenter', { force: true });
  cy.get(dest).trigger('drop', { x: position.x, y: position.y });
}
