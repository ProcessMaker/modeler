import {
  assertDownloadedXmlContainsExpected,
  uploadXml,
} from '../support/utils';

describe('Fix broken diagrams', () => {
  it('test fix broken pool and lanes', () => {
    uploadXml('processWithBrokenPoolAndLanes.xml');

    // load feature file content
    const filename ='processWithBrokenPoolAndLanes_FIXED.xml';
    cy.fixture(filename).then(content => {
      assertDownloadedXmlContainsExpected(content);
    });
  });
});
