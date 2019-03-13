import {
  dragFromSourceToDest,
  typeIntoTextInput,
  waitToRenderAllShapes,
  getElementAtPosition,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Start Timer Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update properties on Start Timer Event', () => {
    const validStartEventTimerXML = `<?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0">
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:startEvent id="node_1" name="Start Event" />
        <bpmn:startEvent id="node_2" name="testing">
          <bpmn:timerEventDefinition>
            <bpmn:timeCycle>2019-03-13T00:00-04:00|R/2019-03-18T00:00-04:00/P21W|R/2019-03-13T00:00-04:00/P21W</bpmn:timeCycle>
          </bpmn:timerEventDefinition>
        </bpmn:startEvent>
      </bpmn:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
          <bpmndi:BPMNShape id="node_1_di" bpmnElement="node_1">
            <dc:Bounds x="150" y="150" width="36" height="36" />
          </bpmndi:BPMNShape>
          <bpmndi:BPMNShape id="node_2_di" bpmnElement="node_2">
            <dc:Bounds x="250.76040649414062" y="250.00347137451172" width="36" height="36" />
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn:definitions>
    `;

    const startTimerEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.startTimerEvent, startTimerEventPosition);

    waitToRenderAllShapes();

    getElementAtPosition(startTimerEventPosition).click();

    const testString = 'testing';
    typeIntoTextInput('[name=name]', testString);

    cy.contains('Timing Control').click();
    typeIntoTextInput('.start-date', '2019-02-06');
    cy.get('.time').select('00:30', { force: true });
    typeIntoTextInput('.repeat', 2);

    cy.get('[data-test=day-1]').click();

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('have', validStartEventTimerXML.trim());
  });
});
