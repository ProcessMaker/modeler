import {
  assertDownloadedXmlContainsExpected,
  getCrownButtonForElement,
  uploadXml,
  waitToRenderAllShapes,
} from '../support/utils';

describe('Pool Lanes', () => {
  it('Deleting first pool deletes One, Two, Three lanes', () => {
    uploadXml('DeletingPoolDeletesRelatedLanes.before.xml');
    waitToRenderAllShapes();
    cy.get('g[data-type="processmaker.modeler.bpmn.pool"]').eq(0)
      .click({ force: true })
      .then($pool => {
        getCrownButtonForElement($pool, 'delete-button').click({ force: true });
      });
    cy.fixture('DeletingPoolDeletesRelatedLanes.after.xml', 'base64').then(data => {
      assertDownloadedXmlContainsExpected(atob(data));
    });
  });
});