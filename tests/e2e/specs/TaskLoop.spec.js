import {
  assertDownloadedXmlMatch,
  uploadXml,
} from '../support/utils';

describe('Task Loop properties', () => {

  it('Set & Unset Loop Maximum property', () => {

    uploadXml('withLoopMarker.xml');

    cy.get('.main-paper [data-type="processmaker.components.nodes.task.Shape"]').click();
    cy.contains('Loop Activity').click();

    // Set Loop Maximum
    cy.get('[data-cy="loopMaximum"]').clear().type('10');
    // Remove Loop Maximum
    cy.get('[data-cy="loopMaximum"]').clear();

    // loopMaximum should be removed from xml
    assertDownloadedXmlMatch(`
      <bpmn:task id="node_1" name="Form Task" pm:assignment="requester">
        <bpmn:standardLoopCharacteristics id="*" />
      </bpmn:task>
    `);

    // Set Loop Maximum
    cy.get('[data-cy="loopMaximum"]').clear().type('10');

    // loopMaximum should be added to xml
    assertDownloadedXmlMatch(`
      <bpmn:task id="node_1" name="Form Task" pm:assignment="requester">
        <bpmn:standardLoopCharacteristics id="*" loopMaximum="10" />
      </bpmn:task>
    `);
  });
});
