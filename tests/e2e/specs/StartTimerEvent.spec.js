import {
  dragFromSourceToDest,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

/* @TODO Skip until Start Timer Event is fixed:
 * https://github.com/ProcessMaker/modeler/issues/256 */
describe.skip('Start Timer Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update properties on Start Timer Event', () => {
    const testString = 'testing';
    const startTimerEventPosition = { x: 250, y: 250 };
    const startDateInput = '.start-date';
    const repeatInput = '.repeat';
    const timeInput = '.time';

    const validStartEventTimerXML = `<?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0">
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:startEvent id="node_2" name="Start Event" />
        <bpmn:startEvent id="node_4" name="testing">
          <bpmn:timerEventDefinition>
            <bpmn:timeCycle>R/2019-02-25T00:30-05:00/P1W</bpmn:timeCycle>
          </bpmn:timerEventDefinition>
        </bpmn:startEvent>
      </bpmn:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
          <bpmndi:BPMNShape id="node_2_di" bpmnElement="node_2">
            <dc:Bounds x="150" y="150" width="36" height="36" />
          </bpmndi:BPMNShape>
          <bpmndi:BPMNShape id="node_4_di" bpmnElement="node_4">
            <dc:Bounds x="250.76040649414062" y="250.00347137451172" width="36" height="36" />
          </bpmndi:BPMNShape>
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn:definitions>
    `;

    dragFromSourceToDest(
      nodeTypes.startTimerEvent,
      '.paper-container',
      startTimerEventPosition
    );

    cy.get('.joint-viewport').find('#j_5').click({force: true});

    typeIntoTextInput('[name=\'name\']', testString);

    typeIntoTextInput(startDateInput, '2019-02-06');
    cy.get(timeInput).select('00:30');
    typeIntoTextInput(repeatInput, 2);

    cy.get('[data-test=day-1]').click();

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => { xml.trim(); }).should('have', validStartEventTimerXML.trim());
  });
});
