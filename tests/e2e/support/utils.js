import { saveDebounce } from '../../../src/components/inspectors/inspectorConstants';

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
    .then(view => view.$el ? view.$el : null);
}

export function getLinksConnectedToElement($element) {
  return cy.window()
    .its('store.state.graph')
    .invoke('getConnectedLinks', { id: $element.attr('model-id') })
    .then(links => {
      return cy.window().its('store.state.paper').then(paper => {
        return links.map(link => link.findView(paper).$el);
      });
    });
}

export function dragFromSourceToDest(source, position) {
  const dataTransfer = new DataTransfer();
  const paper = '.paper-container';
  cy.get(`[data-test=${ source }]`).trigger('dragstart', { dataTransfer });
  cy.get(paper).trigger('dragenter', { force: true });
  cy.get(paper).trigger('drop', { x: position.x, y: position.y });
}

export function getCrownButtonForElement($element, crownButton) {
  return cy
    .get(`#${$element.attr('id')} ~ [data-test=${crownButton}]`)
    .then(crownButtons => crownButtons.filter((index, button) => Cypress.$(button).is(':visible')))
    .then(crownButtons => crownButtons[0]);
}

export function typeIntoTextInput(selector, value) {
  cy.get(selector).clear().type(value);
  waitToRenderNodeUpdates();
}

export function waitToRenderAllShapes() {
  cy.wait(100);
}

export function waitToRenderNodeUpdates() {
  cy.wait(saveDebounce);
}

export function connectNodesWithFlow(flowType, startPosition, endPosition) {
  getElementAtPosition(startPosition)
    .click()
    .then($element => {
      getCrownButtonForElement($element, flowType)
        .click();
    })
    .then(() => {
      getElementAtPosition(endPosition)
        .trigger('mousemove')
        .click({ force: true });
    });
}

export function isElementCovered($element) {
  return cy.window()
    .its('store.state.paper')
    .invoke('findViewsInArea', $element[0].getBBox())
    .then(shapeViews => {
      const zIndexes = shapeViews.filter(shapeView => shapeView.model.component)
        .map(shapeView => shapeView.model.get('z'));

      return cy.window()
        .its('store.state.paper')
        .invoke('getModelById', $element.attr('model-id'))
        .then(shape => {
          const shapeZIndex = shape.get('z');

          return zIndexes.some(zIndex => shapeZIndex < zIndex);
        });
    });
}
