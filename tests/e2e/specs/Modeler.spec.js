import {
  dragFromSourceToDest,
  getGraphElements,
  waitToRenderAllShapes,
  connectNodesWithFlow,
  getElementAtPosition,
  typeIntoTextInput,
  waitToRenderNodeUpdates,
  getLinksConnectedToElement,
  isElementCovered,
  getCrownButtonForElement,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Modeler', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Renders the application without errors', () => {
    cy.get('.header').should('contain', 'ProcessMaker Modeler');
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
      return cy.get('input[type=file]').then($input => {
        return Cypress.Blob.base64StringToBlob(blankProcess, 'text/xml')
          .then((blob) => {
            const testfile = new File([blob], 'blank.bpmn', { type: 'text/xml' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(testfile);
            const input = $input[0];
            input.files = dataTransfer.files;
            return cy.wrap(input).trigger('change', { force: true });
          });
      });
    });

    /* Wait for modal to close */
    cy.wait(300);

    cy.screenshot();

    dragFromSourceToDest(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).click();

    cy.get('[name=id]').should('have.value', 'node_1');
  });

  it('Validates gateway direction', () => {
    const gatewayPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.inclusiveGateway, gatewayPosition);
    waitToRenderAllShapes();

    cy.get('[data-test=validation-list-toggle]').click();
    cy.get('[type=checkbox]').check({ force: true });

    cy.get('[data-test=validation-list]').then($lsit => {
      expect($lsit).to.contain('Gateway must have multiple outgoing Sequence Flows');
    });

    cy.get('[data-test=validation-list-toggle]').click();

    getElementAtPosition(gatewayPosition).click();

    cy.get('[name=gatewayDirection]').select('Converging');

    waitToRenderNodeUpdates();

    cy.get('[data-test=validation-list-toggle]').click();

    cy.get('[data-test=validation-list]').then($lsit => {
      expect($lsit).to.contain('Gateway must have multiple incoming Sequence Flows');
    });
  });

  it('Adding a pool and lanes does not overlap sequence flow', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 250, y: 250 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    const poolPosition = { x: 150, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);
    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .then(isElementCovered)
      .should(isCovered => expect(isCovered).to.be.false);

    getElementAtPosition(poolPosition)
      .click({ force: true })
      .then($pool => getCrownButtonForElement($pool, 'lane-above-button'))
      .click({ force: true });

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .then(isElementCovered)
      .should(isCovered => expect(isCovered).to.be.false);
  });

  it('Selects process node after deleting an element', () => {
    const startEventPosition = { x: 150, y: 150 };
    getElementAtPosition(startEventPosition).click();
    cy.get('#renderer-container').should('to.contain', 'Start Event');

    getElementAtPosition(startEventPosition)
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click();
      });

    waitToRenderAllShapes();

    cy.get('#renderer-container').should('to.not.contain', 'Start Event');
    cy.get('#renderer-container').should('to.contain', 'Process');
  });

  it('Runs custom parser before default parser', function() {
    cy.contains('Upload XML').click();

    /* Wait for modal to open */
    cy.wait(300);

    cy.fixture('parser.xml', 'base64').then(blankProcess => {
      return cy.get('input[type=file]').then($input => {
        return Cypress.Blob.base64StringToBlob(blankProcess, 'text/xml')
          .then((blob) => {
            const testfile = new File([blob], 'parser.xml', { type: 'text/xml' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(testfile);
            const input = $input[0];
            input.files = dataTransfer.files;
            return cy.wrap(input).trigger('change', { force: true });
          });
      });
    });

    /* Wait for modal to close */
    cy.wait(300);

    cy.readFile('/tests/e2e/fixtures/parser.xml', 'utf8').then((sourceXML) =>{
      cy.get('[data-test=downloadXMLBtn]').click();
      cy.window()
        .its('xml')
        .then(xml => xml.trim())
        .then(xml => {
          expect(xml).to.contain(sourceXML.trim());
        });
    });
  });

  it('holds element position after dragging canvas over panels', () => {
    cy.get('.paper-container').trigger('mousedown');
    cy.get('.ignore-pointer').should('have.length', 3);

    cy.get('.paper-container').trigger('mouseup');
    cy.get('.ignore-pointer').should('have.length', 0);
  });
});
