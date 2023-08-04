import {
  assertDownloadedXmlContainsExpected,
  getCrownButtonForElement,
  uploadXml,
  waitToRenderAllShapes,
} from '../support/utils';

describe('Pools', () => {
  it('Case 1 Delete a Pool should remove all elements inside it', () => {
    uploadXml('TwoPools.xml');
    waitToRenderAllShapes();
    cy.get('g[data-type="processmaker.modeler.bpmn.pool"]:visible').eq(1)
      .click({ force: true })
      .then($pool => {
        getCrownButtonForElement($pool, 'delete-button').click({ force: true });
      });
    cy.fixture('TwoPools.after.xml', 'base64').then(data => {
      assertDownloadedXmlContainsExpected(atob(data));
    });
  });

  it('Case 2 Delete a Task inside a Pool, associations and flow nodes should be removed', () => {
    uploadXml('AssociationInsidePool.xml');
    waitToRenderAllShapes();
    cy.get('g[data-type="processmaker.components.nodes.task.Shape"]:visible').eq(0)
      .click({ force: true })
      .then($pool => {
        getCrownButtonForElement($pool, 'delete-button').click({ force: true });
      });
    cy.fixture('AssociationInsidePool.after.xml', 'base64').then(data => {
      assertDownloadedXmlContainsExpected(atob(data));
    });
  });

  it('Case 3 Delete a Pool, should remove event messages too', () => {
    uploadXml('Pools-FlowMessageBetweenPools.xml');
    waitToRenderAllShapes();
    cy.get('g[data-type="processmaker.modeler.bpmn.pool"]:visible').eq(1)
      .click({ force: true })
      .then($pool => {
        getCrownButtonForElement($pool, 'delete-button').click({ force: true });
      });
    cy.fixture('Pools-FlowMessageBetweenPools.after.xml', 'base64').then(data => {
      assertDownloadedXmlContainsExpected(atob(data));
    });
  });

  it('Case 4 Delete a Pool, should remove inner flow events but keep signals definitions, user should remove signals using the UI', () => {
    uploadXml('Pools-DeletePoolCommonSignalEvents.xml');
    waitToRenderAllShapes();
    cy.get('g[data-type="processmaker.modeler.bpmn.pool"]:visible').eq(1)
      .click({ force: true })
      .then($pool => {
        getCrownButtonForElement($pool, 'delete-button').click({ force: true });
      });
    cy.fixture('Pools-DeletePoolCommonSignalEvents.after.xml', 'base64').then(data => {
      assertDownloadedXmlContainsExpected(atob(data));
    });
  });

  it('Case 5 Delete the last Pool, should back to the default empty process', () => {
    uploadXml('Pools-DeleteLastPool.xml');
    waitToRenderAllShapes();
    cy.get('g[data-type="processmaker.modeler.bpmn.pool"]:visible').eq(0)
      .click({ force: true })
      .then($pool => {
        getCrownButtonForElement($pool, 'delete-button').click({ force: true });
      });
    cy.fixture('Pools-DeleteLastPool.after.xml', 'base64').then(data => {
      assertDownloadedXmlContainsExpected(atob(data));
    });
  });
});
