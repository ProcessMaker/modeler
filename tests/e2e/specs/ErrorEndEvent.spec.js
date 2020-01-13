import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlDoesNotContainExpected,
  getCrownButtonForElement,
  getElementAtPosition,
  getXml,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Error End Event', () => {
  const errorEndEventPosition = { x: 250, y: 250 };
  const errorName = 'Awesome error';
  const errorEndEventXml = `
      <bpmn:endEvent id="node_3" name="Error End Event">
        <bpmn:errorEventDefinition errorRef="node_3_error" />
      </bpmn:endEvent>
    `;

  beforeEach(() => {
    addNodeTypeToPaper(errorEndEventPosition, nodeTypes.endEvent, 'switch-to-error-end-event');
    waitToRenderAllShapes();
    cy.get('[data-test=switch-to-error-end-event]').click();
  });

  it('Can create an error end event', () => {
    assertDownloadedXmlContainsExpected(errorEndEventXml, '<bpmn:error id="node_3_error" name="node_3_error" />');
  });

  it('can edit the error end event name', () => {
    getElementAtPosition(errorEndEventPosition).click();

    cy.contains('Error Name').next('input').as('errorNameInput');

    typeIntoTextInput('@errorNameInput', errorName);

    assertDownloadedXmlContainsExpected(`<bpmn:error id="node_3_error" name="${errorName}" />`);
  });

  it('can delete an error end event', () => {
    getElementAtPosition(errorEndEventPosition)
      .then($errorEndEvent => {
        getCrownButtonForElement($errorEndEvent, 'delete-button').click();
      });

    assertDownloadedXmlDoesNotContainExpected(
      errorEndEventXml,
      '<bpmn:error id="node_3_error" name="node_3_error" />',
      `<bpmn:error id="node_3_error" name="${errorName}" />`,
    );
  });

  it('should not create duplicate errors on undo/redo', function() {
    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    getXml().then(xml => {
      const match = xml.match(/<bpmn:error id=".*?" name=".*?" \/>/g);
      const numberOfMessages = match && match.length;
      expect(numberOfMessages).to.equal(1, 'More than 1 message element was found');
    });
  });
});
