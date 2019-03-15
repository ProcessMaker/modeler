import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Intermediate Message Catch Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update properties', () => {
    const testString = 'testing';
    const intermediateMessageCatchEventPosition = { x: 200, y: 200 };

    dragFromSourceToDest(nodeTypes.intermediateMessageCatchEvent, intermediateMessageCatchEventPosition);

    waitToRenderAllShapes();
    getElementAtPosition(intermediateMessageCatchEventPosition).click();

    typeIntoTextInput('[name=name]', testString);
    typeIntoTextInput('[name=eventDefinitionId]', testString);
    typeIntoTextInput('[name=dataName]', testString);
    cy.get('[name=allowedUsers]').select('1,10');
    cy.get('[name=allowedGroups]').select('20,30');
    typeIntoTextInput('[name=whitelist]', testString);

    const validXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:pm="http://processmaker.com/BPMN/2.0/Schema.xsd" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="node_1" name="Start Event" />
    <bpmn:intermediateCatchEvent id="node_2" name="Intermediate Timer Event" pm:allowedUsers="1,10" pm:allowedGroups="1,10" pm:whitelist="testing">
      <bpmn:messageEventDefinition id="testing" pm:dataName="testing" />
    </bpmn:intermediateCatchEvent>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="node_1_di" bpmnElement="node_1">
        <dc:Bounds x="150" y="150" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="node_2_di" bpmnElement="node_2">
        <dc:Bounds x="200.76040649414062" y="200.00347137451172" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('eq', validXML.trim());
  });
});
