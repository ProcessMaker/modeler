import {
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

  it('Save a process with text annotation, pool and lane', function() {
    const poolPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-above-button').click({ force: true });
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });

    const textAnnotationPosition = { x: 400, y: 100 };
    dragFromSourceToDest(nodeTypes.textAnnotation, textAnnotationPosition);

    const taskPosition = { x: 400, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('association-flow-button', textAnnotationPosition, taskPosition);

    const expectedXML = `<bpmn:process id="Process_1" isExecutable="true">
    <bpmn:laneSet>
      <bpmn:lane id="node_3" name="">
        <bpmn:flowNodeRef>node_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>node_7</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="node_4" name="" />
      <bpmn:lane id="node_5" name="" />
    </bpmn:laneSet>
    <bpmn:startEvent id="node_1" name="Start Event" />
    <bpmn:task id="node_7" name="Task" />
    <bpmn:textAnnotation id="node_6">
      <bpmn:text>New Text Annotation</bpmn:text>
    </bpmn:textAnnotation>
    <bpmn:association id="node_8" associationDirection="None" sourceRef="node_6" targetRef="node_7" />`;

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .then(xml => {
        expect(xml).to.contain(expectedXML.trim());
      });
  });
});
