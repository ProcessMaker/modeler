import {
  dragFromSourceToDest,
  getGraphElements,
  waitToRenderAllShapes,
  connectNodesWithFlow,
  getElementAtPosition,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Modeler', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Renders the application without errors', () => {
    cy.get('.navbar').should('contain', 'ProcessMaker Modeler');
  });

  it('Create a simple process', () => {
    /* Only the initial start element should exist */
    const initialNumberOfElements = 1;

    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    const taskPosition = { x: 300, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    const startEventPosition = { x: 150, y: 150 };
    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    const task2Position = { x: 300, y: 350 };
    dragFromSourceToDest(nodeTypes.task, task2Position);
    waitToRenderAllShapes();
    connectNodesWithFlow('sequence-flow-button', taskPosition, task2Position);

    const task3Position = { x: 100, y: 350 };
    dragFromSourceToDest(nodeTypes.task, task3Position);
    waitToRenderAllShapes();
    connectNodesWithFlow('sequence-flow-button', task2Position, task3Position);

    const endEventPosition = { x: 100, y: 500 };
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition);
    waitToRenderAllShapes();
    connectNodesWithFlow('sequence-flow-button', task3Position, endEventPosition);

    dragFromSourceToDest(nodeTypes.pool, { x: 100, y: 100 });

    waitToRenderAllShapes();

    const numberOfNewElementsAdded = 9;
    getGraphElements().should('have.length', initialNumberOfElements + numberOfNewElementsAdded);
  });

  it('Updates element name and validates xml', () => {
    waitToRenderAllShapes();

    const startEventPosition = { x: 150, y: 150 };
    getElementAtPosition(startEventPosition).click();

    const testString = 'testing';
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);

    cy.get('[data-test=downloadXMLBtn]').click();

    const validXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="node_1" name="${testString}" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="node_1_di" bpmnElement="node_1">
        <dc:Bounds x="150" y="150" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    cy.window().its('xml')
      .then(xml => xml.trim())
      .should('eq', validXML.trim());
  });

  it('Prevent element to connect to self', () => {
    /* Only the initial start element should exist */
    const initialNumberOfElements = 1;

    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    const taskPosition = { x: 400, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    connectNodesWithFlow('sequence-flow-button', taskPosition, taskPosition);

    const numberOfNewElementsAdded = 1;
    getGraphElements().should('have.length', initialNumberOfElements + numberOfNewElementsAdded);
  });

  it('Generates sequential, unique node IDs', () => {
    waitToRenderAllShapes();

    const startEventPosition = { x: 150, y: 150 };
    getElementAtPosition(startEventPosition).click();

    cy.get('[name=id]').should('have.value', 'node_1');

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).click();

    cy.get('[name=id]').should('have.value', 'node_2');

    typeIntoTextInput('[name=id]', 'node_3');

    const task2Position = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.task, task2Position);
    waitToRenderAllShapes();
    getElementAtPosition(task2Position).click();

    cy.get('[name=id]').should('have.value', 'node_4');

    const task3Position = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.task, task3Position);
    waitToRenderAllShapes();
    getElementAtPosition(task3Position).click();

    cy.get('[name=id]').should('have.value', 'node_5');

    cy.contains('Upload XML').click();

    /* Wait for modal to open */
    cy.wait(300);

    cy.fixture('../../../src/blank.bpmn', 'base64').then(blankProcess => {
      cy.get('input[type=file]').then($input => {
        Cypress.Blob.base64StringToBlob(blankProcess, 'text/xml')
          .then((blob) => {
            const testfile = new File([blob], 'blank.bpmn', { type: 'text/xml' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(testfile);
            const input = $input[0];
            input.files = dataTransfer.files;
          });
      });
    });

    /* Wait for modal to close */
    cy.wait(300);

    dragFromSourceToDest(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).click();

    cy.get('[name=id]').should('have.value', 'node_1');
  });
});
