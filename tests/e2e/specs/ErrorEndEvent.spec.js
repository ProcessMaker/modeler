import {
  dragFromSourceToDest, assertDownloadedXmlContainsExpected, getElementAtPosition, typeIntoTextInput, getCrownButtonForElement, assertDownloadedXmlDoesNotContainExpected,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Error End Event', () => {
  it('Can create and delete error end event', function() {
    const errorEndEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.errorEndEvent, errorEndEventPosition);

    const errorEndEventXml = `
      <bpmn:endEvent id="node_2" name="Error End Event">
        <bpmn:errorEventDefinition errorRef="node_2_error" />
      </bpmn:endEvent>
    `;

    assertDownloadedXmlContainsExpected(errorEndEventXml, '<bpmn:error id="node_2_error" name="node_2_error" />');

    getElementAtPosition(errorEndEventPosition).click();
    cy.contains('Error Name').next('input').as('errorNameInput');
    const errorName = 'Awesome error';
    typeIntoTextInput('@errorNameInput', errorName);

    assertDownloadedXmlContainsExpected(`<bpmn:error id="node_2_error" name="${errorName}" />`);

    getElementAtPosition(errorEndEventPosition)
      .then($errorEndEvent => {
        getCrownButtonForElement($errorEndEvent, 'delete-button').click();
      });

    assertDownloadedXmlDoesNotContainExpected(
      errorEndEventXml,
      '<bpmn:error id="node_2_error" name="node_2_error" />',
      `<bpmn:error id="node_2_error" name="${errorName}" />`
    );
  });
});
