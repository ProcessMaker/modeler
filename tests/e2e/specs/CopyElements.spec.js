import { assertDownloadedXmlContainsExpected, getElementAtPosition } from '../support/utils';

describe('Copy element', () => {
  it('should copy start events', () => {
    const startEventPosition = { x: 150, y: 150 };

    getElementAtPosition(startEventPosition).click();
    cy.get('[data-test=copy-button]').click();
    cy.get('[data-test=copy-button]').click();

    const processWithTwoStartEventCopies = `
      <?xml version="1.0" encoding="UTF-8"?>
      <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0">
        <bpmn:process id="Process_1" isExecutable="true">
          <bpmn:startEvent id="node_1" name="Start Event" />
          <bpmn:startEvent id="node_2" name="Start Event" />
          <bpmn:startEvent id="node_3" name="Start Event" />
        </bpmn:process>
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
          <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
            <bpmndi:BPMNShape id="node_1_di" bpmnElement="node_1">
              <dc:Bounds x="150" y="150" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="node_2_di" bpmnElement="node_2">
              <dc:Bounds x="150" y="216" width="36" height="36" />
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="node_3_di" bpmnElement="node_3">
              <dc:Bounds x="150" y="282" width="36" height="36" />
            </bpmndi:BPMNShape>
          </bpmndi:BPMNPlane>
        </bpmndi:BPMNDiagram>
      </bpmn:definitions>
    `;

    assertDownloadedXmlContainsExpected(processWithTwoStartEventCopies);
  });
});
