import {
  assertDownloadedXmlContainsExpected,
  uploadXml,
} from '../support/utils';

describe('Fix broken diagrams', () => {
  it('test fix broken sequence flows', () => {
    uploadXml('processWithBrokenSequenceFlows.xml');

    // load feature file content
    const filename ='processWithBrokenSequenceFlows_FIXED.xml';
    cy.fixture(filename).then(content => {
      assertDownloadedXmlContainsExpected(content);
    });
  });

  it('test fix broken sequence flows in bpmn2 namespace', () => {
    uploadXml('processWithBrokenSequenceFlows_BPMN2.xml');

    // load feature file content
    const filename ='processWithBrokenSequenceFlows_BPMN2_FIXED.xml';
    cy.fixture(filename).then(content => {
      assertDownloadedXmlContainsExpected(content);
    });
  });
});
