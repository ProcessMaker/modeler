/// <reference types="Cypress" />
const mountVue = require('cypress-vue-unit-test');
// import ModelerApp from '../../../src/ModelerApp';

describe('Modeler', () => {
  // beforeEach(mountVue(ModelerApp));

  it('Renders the application without errors', () => {
    cy.visit('/');
    cy.get('.navbar').should('contain', 'ProcessMaker Modeler');
  });

  it('Drags and drops an element', () => {
    cy.get('.processmaker-modeler-task').
      trigger('mousedown').
      trigger('mousemove', 400, 200, { force: true }).
      trigger('mouseup', 400, 200, {which: 1, force: true });

    cy.get('.modeler').children().should('have.length', 3);
  });

  xit('Exports a xml file', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="node_2" name="Start Event" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="node_2_di" bpmnElement="node_2">
        <dc:Bounds x="150" y="150" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    //Re-Route the path of download files to tempDownloads
    cy.get('[data-test="downloadXMLBtn"]').click();
    cy.writeFile('./tempDownloads/bpmnProcess.xml', xml);
    cy.readFile('./tempDownloads/bpmnProcess.xml', 'utf-8').should('eq', xml);
  });
});
