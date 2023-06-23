import {saveDebounce} from '../../../src/components/inspectors/inspectorConstants';
import path from 'path';
import {boundaryEventSelector, nodeTypes, taskSelector} from './constants';

const renderTime = 300;

export function getTinyMceEditor() {
  return cy
    .get('iframe#documentation-editor_ifr')
    .its('0.contentDocument')
    .its('body')
    .then(cy.wrap);
}

export function getTinyMceEditorInModal() {
  return cy
    .get('iframe#documentation-editor-modal_ifr')
    .its('0.contentDocument')
    .its('body')
    .then(cy.wrap);
}

export function setBoundaryEvent(nodeType, taskPosition, taskType = nodeTypes.task) {
  const dataTest = nodeType.replace('processmaker-modeler-', 'add-');
  waitToRenderAllShapes();

  getElementAtPosition(taskPosition, taskType).click({force: true});

  cy.get('[data-test="boundary-event-dropdown"]').click({force: true});
  cy.get(`[data-test="${dataTest}"`).click({ force: true });
  waitToRenderAllShapes();
}

export function getGraphElements() {
  return cy.window()
    .its('store.state.graph')
    .invoke('getCells')
    .then(cells => cells.filter(cell => cell.component));
}

export function getElementAtPosition(position, componentType, offsetX = 0, offsetY = 0) {
  const paperGridSize = 150;
  const searchRectangle = {
    width: paperGridSize,
    height: paperGridSize,
    x: position.x - paperGridSize / 2 + offsetX,
    y: position.y - paperGridSize / 2 + offsetY,
  };

  return cy.window()
    .its('store.state.paper')
    .invoke('findViewsInArea', searchRectangle)
    .then(views => views.filter(view => view.model.component))
    .then(views => {
      return views;
    })
    .then(views => {
      return componentType
        ? views.filter(view => view.model.component.node.type === componentType)
        : views;
    })
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

export function getComponentsEmbeddedInShape($element) {
  return cy.window()
    .its('store.state.graph')
    .invoke('getCell', $element.attr('model-id'))
    .then(shape => shape.getEmbeddedCells())
    .then(embeddedCells => embeddedCells.filter(cell => cell.component))
    .then(embeddedComponents => {
      return cy.window().its('store.state.paper').then(paper => {
        return embeddedComponents.map(cell => cell.findView(paper).$el);
      });
    });
}

export function dragFromSourceToDest(sourceMain, position, source=null) {
  cy.window().its('store.state.paper').then(paper => {
    paper.translate(0, 0);
    const { tx, ty } = paper.translate();

    cy.get('.main-paper').then($paperContainer => {
      const { x, y } = $paperContainer[0].getBoundingClientRect();
      const mouseEvent = { clientX: position.x + x + tx, clientY: position.y + y + ty };

      cy.get(`[data-test="${sourceMain}-main"]`).click();

      if (source) {
        cy.get(`[data-test="${source}"]`).click();
      } else {
        cy.get(`[data-test="${sourceMain}"]`).click();
      }

      cy.document().trigger('mouseover', mouseEvent);
      cy.document().trigger('mouseup', mouseEvent);

      cy.get('.paper-container').click(position);
    });
  });

  return waitToRenderAllShapes();
}

export function getPositionInPaperCoords(position) {
  return cy.window().its('store.state.paper').then(paper => {
    const { tx, ty } = paper.translate();

    return cy.get('.main-paper').then($paperContainer => {
      const { x, y } = $paperContainer[0].getBoundingClientRect();
      return { x: position.x + x + tx, y: position.y + y + ty };
    });
  });
}

export function getCrownButtonForElement($element, crownButton) {
  return cy.get(`#${crownButton}`);
}

export function typeIntoTextInput(selector, value) {
  cy.get(selector).clear().type(value);
  waitToRenderNodeUpdates();
}

export function selectOptionByName(selector, name) {
  cy.get(selector).click();
  cy.get(selector).get('li span span:contains("' + name + '")').click();
  waitToRenderNodeUpdates();
}

export function waitToRenderAllShapes() {
  cy.wait(renderTime);
}

export function waitForAnimations() {
  cy.wait(renderTime);
}

export function waitToRenderNodeUpdates() {
  cy.wait(saveDebounce);
}

export function connectNodesWithFlow(flowType, startPosition, endPosition, clickPosition = 'center') {
  const mouseEvent = { clientX: startPosition.x , clientY: startPosition.y };
  return getElementAtPosition(startPosition)
    .trigger('mousedown', mouseEvent, { force: true })
    .trigger('mouseup', mouseEvent,  { force: true })
    .then($element => {
      return getCrownButtonForElement($element, flowType)
        .click();
    })
    .then(() => {
      getElementAtPosition(endPosition).then($endElement => {
        getPositionInPaperCoords(endPosition).then(({ x, y }) => {
          cy.wrap($endElement)
            .trigger('mousemove', { clientX: x, clientY: y, force: true })
            .wait(renderTime)
            .click(clickPosition, { force: true });
        });
      });
    });
}

export function isElementCovered($element) {
  cy.window()
    .its('store.state')
    .then(({ paper, graph }) => {
      const shape = graph.getCell($element.attr('model-id'));
      let shapeViews = paper.findViewsInArea(shape.getBBox());

      if (shape.isLink()) {
        shapeViews = shapeViews.filter(shapeView => {
          return ![shape.getSourceElement(), shape.getTargetElement()].includes(shapeView.model);
        });
      }

      const zIndexes = shapeViews.filter(shapeView => shapeView.model.component)
        .map(shapeView => shapeView.model.get('z'));
      const shapeZIndex = shape.get('z');

      return zIndexes.some(zIndex => shapeZIndex < zIndex);
    });
}

export function moveElement(elementPosition, x, y, componentType) {
  return cy.window().its('store.state.paper').then(paper => {
    const newPosition = paper.localToPagePoint(x, y);

    return getElementAtPosition(elementPosition, componentType)
      .trigger('mousedown', { which: 1, force: true })
      .trigger('mousemove', { clientX: newPosition.x, clientY: newPosition.y, force: true })
      .trigger('mouseup', { force: true });
  });
}

export function moveElementRelativeTo(elementPosition, x, y, componentType) {
  return cy.window().its('store.state.paper').then(paper => {

    return getElementAtPosition(elementPosition, componentType)
      .then($element => {
        const { left, top } = $element.position();
        const newPosition = paper.localToPagePoint(left + x, top + y);
        const { tx, ty } = paper.translate();

        return cy.get('.main-paper').then($paperContainer => {
          const { x: paperX, y: paperY } = $paperContainer[0].getBoundingClientRect();
          const mouseMoveOptions = {
            clientX: newPosition.x - (paperX + tx),
            clientY: newPosition.y - (paperY + ty),
            force: true,
          };

          cy.wrap($element)
            .trigger('mousedown', 'topLeft', { which: 1, force: true })
            .trigger('mousemove', 'topLeft', mouseMoveOptions)
            .trigger('mouseup', 'topLeft', { force: true });
        });

      });
  });
}

export function removeIndentationAndLinebreaks(string) {
  return string.replace(/(^\s+)|(\n)/gim, '');
}

export function removeElementAtPosition(elementPosition) {
  getElementAtPosition(elementPosition)
    .click()
    .then($el => {
      return getCrownButtonForElement($el, 'delete-button');
    })
    .click();
}

export function removeStartEvent(startEventPosition = {x: 150, y: 150}) {
  removeElementAtPosition(startEventPosition);
}

export const modalAnimationTime = 300;

export function uploadXml(filepath) {
  cy.contains('Upload XML').click();

  /* Wait for modal to open */
  cy.wait(modalAnimationTime);

  cy.fixture(filepath, 'base64').then(bpmnProcess => {
    return cy.get('input[type=file]').then($input => {
      const blob = Cypress.Blob.base64StringToBlob(bpmnProcess, 'text/xml');
      const file = new File([blob], path.basename(filepath), { type: 'text/xml' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const input = $input[0];
      input.files = dataTransfer.files;
      cy.wrap(input).trigger('change', { force: true });
      return cy.get('#uploadmodal button').contains('Upload').click();
    });
  });

  /* Wait for modal to close */
  cy.wait(modalAnimationTime);
}

export function testNumberOfVertices(expectedVertices) {
  cy.window()
    .its('store.state')
    .then(state => {
      const { graph, paper } = state;
      const firstLink = graph.getLinks()[0];
      const waypoints = firstLink.findView(paper).getConnection().segments;
      expect(waypoints.length).to.equal(expectedVertices, `We should have ${expectedVertices} waypoints`);

      if (Cypress.env('inProcessmaker')) {
        return;
      }
    });
}

export function getNumberOfLinks() {
  return cy.window()
    .its('store.state')
    .then(({ graph }) => graph.getLinks().length);
}

export function assertElementsAreConnected(connectedFromId, connectedToId) {
  return cy.window()
    .its('store.state')
    .then(({ graph }) => {
      const linkFound = graph.getLinks().some((link) => {
        return link.getSourceElement().component.node.definition.id === connectedFromId
          && link.getTargetElement().component.node.definition.id === connectedToId;
      });

      let message = `Link should be from '${connectedFromId}' to '${connectedToId}'`;
      if (!linkFound) {
        message = `No link found from '${connectedFromId}' to '${connectedToId}'`;
      }

      expect(linkFound, message).to.be.true;
    });
}

export function getXml() {
  cy.get('[data-test=downloadXMLBtn]').click();
  return cy.window()
    .its('xml')
    .then(removeIndentationAndLinebreaks);
}

export function assertDownloadedXmlContainsExpected(...xmlStrings) {
  getXml().then(xml => {
    xmlStrings.forEach(xmlString => {
      expect(xml).to.contain(removeIndentationAndLinebreaks(xmlString));
    });
  });
}

export function assertDownloadedXmlDoesNotContainExpected(xmlString) {
  getXml().then(xml => {
    expect(xml).to.not.contain(removeIndentationAndLinebreaks(xmlString));
  });
}

export function assertDownloadedXmlMatch(xmlString) {
  getXml().then(xml => {
    // Escape xmlString to regexp
    xmlString = removeIndentationAndLinebreaks(xmlString);
    const escapedXmlString = xmlString.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    // xmlString can contain * which means any number of characters
    expect(xml).to.match(new RegExp(escapedXmlString.replace(/\\\*/g, '\\w*')));
  });
}

export function assertDownloadedXmlContainsSubstringNTimes(substring, expectedCount, message) {
  getXml().then(xml => {
    const matches = xml.match(new RegExp(substring, 'g'));
    expect(matches).to.have.lengthOf(expectedCount, message);
  });
}

export function assertBoundaryEventIsCloseToTask() {
  const positionErrorMargin = 30;

  cy.get(taskSelector).then($task => {
    const { left: taskLeft, top: taskTop } = $task.position();
    cy.get(boundaryEventSelector).then($boundaryEvent => {
      const { left, top } = $boundaryEvent.position();
      expect(left).to.be.closeTo(taskLeft, positionErrorMargin);
      expect(top).to.be.closeTo(taskTop, positionErrorMargin);
    });
  });
}

export function addNodeTypeToPaper(nodePosition, genericNode, nodeToSwitchTo) {
  clickAndDropElement(genericNode, nodePosition);
  waitToRenderAllShapes();
  cy.get(`[data-test=${nodeToSwitchTo}]`).click();
  cy.wait(300);
}

export function modalConfirm() {
  cy.get('.modal-footer .btn-primary').click();
}

export function modalCancel() {
  cy.get('.modal-footer .btn-secondary').click();
}

export function getPeriodicityStringUSFormattedDate(date, time = false) {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');
  let dateString = month + '/' + day + '/' + year;
  if (time) {
    let timeString = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    dateString += ' ' + timeString;
  }
  return dateString;
}

/**
 * This method is responsible to enter inside component iframe
 * @return iframe od documentation
 */
export function getIframeDocumentation() {
  cy.get('[id="accordion-button-documentation-accordion"]').click();
  const getIframeDocument = () => {
    return cy
      .get('iframe[id *= "documentation-editor"]')
      .its('0.contentDocument').should('exist');
  };
  const getIframeBody = () => {
    return getIframeDocument()
      .its('body').should('not.be.undefined')
      .then(cy.wrap);
  };
  return getIframeBody();
}

/**
 * This method is responsible to change the component type of an element
 * @param component: selector of the component
 * @param type: component type, example: switch-to-signal-end-event
 * @return nothing returns
 */
export function selectComponentType(component, type) {
  cy.get(component).first().click({force:true});
  cy.get('[data-test="select-type-dropdown"]').click();
  cy.get('[data-test="'+type+'"]').click();
  cy.get('[class="btn btn-primary"]').should('be.visible').click();
}

export function clickAndDropElement(node, position, nodeChild = null) {
  cy.window().its('store.state.paper').then(paper => {
    const { tx, ty } = paper.translate();

    cy.get('.main-paper').then($paperContainer => {
      const { x, y } = $paperContainer[0].getBoundingClientRect();
      const mouseEvent = { clientX: position.x + x + tx, clientY: position.y + y + ty };

      const existExplorerRail = Cypress.$('[data-test=explorer-rail]').length === 1;

      if (existExplorerRail) {
        cy.get('[data-test=explorer-rail]').find(`[data-test=${node}]`).click();
      } else {
        cy.get(`[data-test=${node}-main]`).click();

        if (nodeChild) {
          cy.get(`[data-test=${nodeChild}]`).click();
        }
      }

      cy.document().trigger('mousemove', mouseEvent);
      cy.wait(300);
      cy.get('.paper-container').trigger('mousedown', mouseEvent);
      cy.wait(300);
      cy.get('.paper-container').trigger('mouseup', mouseEvent);
    });
  });
}
