import {
  dragFromSourceToDest,
  connectNodesWithFlow,
  getElementAtPosition,
  getLinksConnectedToElement,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Sequence Flows', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Can connect two elements', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 250, y: 250 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    const numberOfSequenceFlowsAdded = 1;

    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .should($links => {
        expect($links.length).to.eq(numberOfSequenceFlowsAdded);
      });
  });

  it('Update Condition expression', () => {
    const exclusiveGatewayPosition = { x: 400, y: 300 };
    dragFromSourceToDest(
      nodeTypes.exclusiveGateway, exclusiveGatewayPosition);

    const taskPosition = { x: 400, y: 500 };
    dragFromSourceToDest(
      nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', exclusiveGatewayPosition, taskPosition);

    getElementAtPosition(exclusiveGatewayPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    const testString = 'foo > 7';
    typeIntoTextInput('[name="conditionExpression.body"]', testString);
    cy.get('[name="conditionExpression.body"]').should('have.value', testString);
  });

  it('Modify vertices', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 400, y: 250 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    cy.get('.connection-wrap')
      .trigger('mousedown', { which: 1, force: true })
      .trigger('mousemove', { clientX: 500, clientY: 500, force: true })
      .trigger('mouseup', {force: true});

    const validXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="node_1" name="Start Event">
      <bpmn:outgoing>node_3</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="node_2" name="Task">
      <bpmn:incoming>node_3</bpmn:incoming>
    </bpmn:task>
    <bpmn:sequenceFlow id="node_3" sourceRef="node_1" targetRef="node_2" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="node_1_di" bpmnElement="node_1">
        <dc:Bounds x="150" y="150" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="node_2_di" bpmnElement="node_2">
        <dc:Bounds x="400.7604064941406" y="250.9861068725586" width="116" height="76" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="node_3_di" bpmnElement="node_3">
        <di:waypoint x="168" y="186" />
        <di:waypoint x="168" y="450" />
        <di:waypoint x="280" y="450" />
        <di:waypoint x="280" y="289" />
        <di:waypoint x="401" y="289" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim()).should('to.contain', validXML.trim());
  });
});
