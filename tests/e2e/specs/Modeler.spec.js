/// <reference types="Cypress" />

const generateXML = (nodeName) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="node_2" name="${nodeName}" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="node_2_di" bpmnElement="node_2">
        <dc:Bounds x="150" y="150" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`.replace(/[^\x20-\x7E]/gmi, '');
};

const dragFromSourceToDest = (source, dest, position) => {
  const dataTransfer = new DataTransfer();
  cy.get(source).trigger('dragstart', { dataTransfer });
  cy.get(dest).trigger('dragenter');
  cy.get(dest).trigger('drop', { offsetX: position.x, offsetY: position.y });
};

const nodeTypes = [
  '.processmaker-modeler-task',
  '.processmaker-modeler-end-event',
  '.processmaker-modeler-script-task',
  '.processmaker-modeler-exclusive-gateway',
  '.processmaker-modeler-text-annotation',
  '.processmaker-modeler-pool',
];

describe('Modeler', () => {
  beforeEach(()=> {
    cy.visit('/');
    cy.reload();
  });

  it('Renders the application without errors', () => {
    cy.get('.navbar').should('contain', 'ProcessMaker Modeler');
  });

  nodeTypes.forEach((type) => {
    it('Renders list of nodes', () => {
      cy.get('.modeler').children().should('have.length', 2);

      dragFromSourceToDest(
        type,
        '.paper-container',
        { x: 400, y: 200 },
      );

      cy.get('.modeler').children().should('have.length', 3);
    });
  });

  xit('Updates element name', ()=> {
    // Check if element is on the paper
    cy.get('.modeler').children().should('have.length', 2);

    // Select element
    cy.get('.joint-viewport').click();

    // focus name input + Add value (type event)
    cy.get('[name=\'name\']').focus().clear().type('testing');

    // Assert - check if name is updated on paper
    cy.get('.joint-viewport').contains('testing');

    // Assert - Valid XML
    cy.get('[data-test="downloadXMLBtn"]').click();

    const validXML = generateXML('testing');

    cy.get('[data-test="downloadXMLBtn"]').click();

    cy.window().its('xml').should('eq', validXML);
  });

  xit('Exports a xml file', () => {
    // cy.get('[data-test="downloadXMLBtn"]').click();
    const validXML = generateXML('Start Event');
    cy.window().its('xml').should('eq', validXML);
  });
});
