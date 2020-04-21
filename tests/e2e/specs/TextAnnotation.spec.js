import {
  assertDownloadedXmlContainsExpected,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getElementAtPosition,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';
import { baseNodeColors } from '../../../src/components/nodeColors';

describe('Text Annotation', () => {
  it('Update text annotation name', () => {
    const testString = 'testing';

    const textAnnotationPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.textAnnotation, textAnnotationPosition);

    getElementAtPosition(textAnnotationPosition).click();

    typeIntoTextInput('[name=text]', testString);
    cy.get('[name=text]').should('have.value', testString);
  });

  it('should be able to add a text annotation outside of a pool', () => {
    const poolPosition = { x: 250, y: 200 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const textAnnotationPosition = { x: 400, y: 50 };
    dragFromSourceToDest(nodeTypes.textAnnotation, textAnnotationPosition);

    connectNodesWithFlow('association-flow-button', textAnnotationPosition, poolPosition);

    const expectedXML = `<bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="node_1" name="Start Event" />
    <bpmn:textAnnotation id="node_3">
      <bpmn:text>Text Annotation</bpmn:text>
    </bpmn:textAnnotation>
    <bpmn:association id="node_4" associationDirection="None" sourceRef="node_3" targetRef="node_2" />
  </bpmn:process>`;

    assertDownloadedXmlContainsExpected(expectedXML);
  });

  it('keeps custom color when updating node text', () => {
    const colorToSelect = baseNodeColors[0];
    const textAnnotationPosition = { x: 400, y: 100 };
    dragFromSourceToDest(nodeTypes.textAnnotation, textAnnotationPosition);

    getElementAtPosition(textAnnotationPosition).click();
    cy.get('[data-test="picker-dropdown-button"]').click();
    cy.get(`[data-test="${colorToSelect}"]`).click();
    typeIntoTextInput('[name=text]', 'new text');

    const annotationTextSelector = '.main-paper [data-type="textAnnotation"] [joint-selector="label"]';
    cy.get(annotationTextSelector).should('have.attr', 'fill', colorToSelect);
  });
});
