import {
  assertDownloadedXmlContainsExpected,
  connectNodesWithFlow,
  dragFromSourceToDest,
  getCrownButtonForElement,
  getElementAtPosition,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

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
});
