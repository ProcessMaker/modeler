import {
  connectNodesWithFlow,
  dragFromSourceToDest,
  getCrownButtonForElement,
  getElementAtPosition,
  getGraphElements,
  getLinksConnectedToElement,
  isElementCovered,
  removeIndentationAndLinebreaks,
  typeIntoTextInput,
  uploadXml,
  waitToRenderAllShapes,
  waitToRenderNodeUpdates,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Modeler', () => {
  it('Create a simple process', () => {
    /* Only the initial start element should exist */
    const initialNumberOfElements = 1;

    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    const taskPosition = { x: 300, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const startEventPosition = { x: 150, y: 150 };
    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    const task2Position = { x: 300, y: 350 };
    dragFromSourceToDest(nodeTypes.task, task2Position);
    connectNodesWithFlow('sequence-flow-button', taskPosition, task2Position);

    const task3Position = { x: 100, y: 350 };
    dragFromSourceToDest(nodeTypes.task, task3Position);
    connectNodesWithFlow('sequence-flow-button', task2Position, task3Position);

    const endEventPosition = { x: 100, y: 500 };
    dragFromSourceToDest(nodeTypes.endEvent, endEventPosition);
    connectNodesWithFlow('sequence-flow-button', task3Position, endEventPosition);

    dragFromSourceToDest(nodeTypes.pool, { x: 100, y: 100 });

    const numberOfNewElementsAdded = 9;
    getGraphElements().should('have.length', initialNumberOfElements + numberOfNewElementsAdded);
  });

  it('Updates element name and validates xml', function() {
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

    cy.window()
      .its('xml')
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

    connectNodesWithFlow('sequence-flow-button', taskPosition, taskPosition);

    const numberOfNewElementsAdded = 1;
    getGraphElements().should('have.length', initialNumberOfElements + numberOfNewElementsAdded);
  });

  it('Generates sequential, unique node IDs', function() {
    waitToRenderAllShapes();

    const startEventPosition = { x: 150, y: 150 };
    getElementAtPosition(startEventPosition).click();

    cy.get('[name=id]').should('have.value', 'node_1');

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    getElementAtPosition(taskPosition).click();
    cy.get('#accordion-button-advanced').click();

    cy.get('[name=id]').should('have.value', 'node_2');

    typeIntoTextInput('[name=id]', 'node_3');

    const task2Position = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.task, task2Position);
    getElementAtPosition(task2Position).click();

    cy.get('[name=id]').should('have.value', 'node_4');

    const task3Position = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.task, task3Position);
    getElementAtPosition(task3Position).click();

    cy.get('[name=id]').should('have.value', 'node_5');

    uploadXml('../../../src/blank.bpmn');

    dragFromSourceToDest(nodeTypes.task, taskPosition);
    getElementAtPosition(taskPosition).click();

    cy.get('[name=id]').should('have.value', 'node_1');
  });

  it('Validates gateway direction', () => {
    const gatewayPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.inclusiveGateway, gatewayPosition);

    cy.get('[data-test=validation-list-toggle]').click();
    cy.get('[type=checkbox]').check({ force: true });

    cy.get('[data-test=validation-list]').should($lsit => {
      expect($lsit).to.contain('Gateway must have multiple outgoing Sequence Flows');
    });

    cy.get('[data-test=validation-list-toggle]').click();

    getElementAtPosition(gatewayPosition).click();

    cy.get('[name=gatewayDirection]').select('Converging');

    waitToRenderNodeUpdates();

    cy.get('[data-test=validation-list-toggle]').click();

    cy.get('[data-test=validation-list]').should($lsit => {
      expect($lsit).to.contain('Gateway must have multiple incoming Sequence Flows');
    });
  });

  it('Adding a pool and lanes does not overlap sequence flow', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 250, y: 250 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    const poolPosition = { x: 150, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .then(isElementCovered).should(isCovered => expect(isCovered).to.be.false);

    getElementAtPosition(poolPosition)
      .click({ force: true })
      .then($pool => getCrownButtonForElement($pool, 'lane-above-button')).click({ force: true });

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .then(isElementCovered).should(isCovered => expect(isCovered).to.be.false);
  });

  it('Selects process node after deleting an element', () => {
    const startEventPosition = { x: 150, y: 150 };
    getElementAtPosition(startEventPosition).click();
    cy.get('[data-test=inspector-container]').should('to.contain', 'Start Event');

    getElementAtPosition(startEventPosition)
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click();
      });

    waitToRenderAllShapes();

    cy.get('[data-test=inspector-container]').should('to.not.contain', 'Start Event');
    cy.get('[data-test=inspector-container]').should('to.contain', 'Process');
  });

  it('Runs custom parser before default parser', function() {
    uploadXml('parser.xml');

    cy.readFile('tests/e2e/fixtures/parser.xml', 'utf8').then(sourceXML => {
      cy.get('[data-test=downloadXMLBtn]').click();
      cy.window()
        .its('xml')
        .then(xml => xml.trim())
        .should(xml => {
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

  it('check if process id is a valid QName', () => {
    cy.get('[name=id]').clear();

    const invalidId = '12 id!';
    typeIntoTextInput('[name=id]', invalidId);

    cy.get('.invalid-feedback').should('contain', 'The id format is invalid.');

    const validId = 'Process_1';
    typeIntoTextInput('[name=id]', validId);

    cy.get('.invalid-feedback').should('not.have.value', 'The id format is invalid.');
  });

  it('updates validation after undo/redo', () => {
    cy.get('[data-test=validation-toggle]').click({ force: true });
    cy.get('[data-test=validation-list-toggle]').click();

    const initialNumberOfValidationErrors = 2;
    cy.get('[data-test=validation-list]').children().should('have.length', initialNumberOfValidationErrors);

    const startEventPosition = { x: 150, y: 150 };

    getElementAtPosition(startEventPosition).then($startEvent => {
      cy.wrap($startEvent).find('[stroke=red]').should('exist');
    });

    const taskPosition = { x: 150, y: 300 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const numberOfNewValidationErrors = 1;
    cy.get('[data-test=validation-list]').children()
      .should('have.length', initialNumberOfValidationErrors + numberOfNewValidationErrors).should('contain', 'node_2');

    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition).then($startEvent => {
      cy.wrap($startEvent).find('[stroke=red]').should('exist');
    });

    cy.get('[data-test=validation-list]').children()
      .should('have.length', initialNumberOfValidationErrors)
      .should('not.contain', 'node_2');

    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    cy.get('[data-test=validation-list]').children()
      .should('have.length', initialNumberOfValidationErrors + numberOfNewValidationErrors)
      .should('contain', 'node_2');

    getElementAtPosition(startEventPosition).then($startEvent => {
      cy.wrap($startEvent).find('[stroke=red]').should('exist');
    });

    getElementAtPosition(taskPosition).then($task => {
      cy.wrap($task).find('[stroke=red]').should('exist');
    });
  });

  it('shows warning for unknown element during parsing', function() {
    uploadXml('unknownElement.xml');
    const warning = 'DataStoreReference is an unsupported element type in parse';

    cy.get('.status-bar-container__status').click({ multiple: true });
    cy.get('[data-test="validation-list"]').should('contain', warning);
  });

  it('check for joint marker class on linkTools', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 300, y: 300 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);
    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click('topRight');

    cy.get('[data-tool-name=vertices]').trigger('mousedown', 'topRight');
    cy.get('[data-tool-name=vertices]').trigger('mousemove', 'bottomLeft', { force: true });
    cy.get('[data-tool-name=vertices]').trigger('mouseup', 'bottomLeft', { force: true });
    cy.get('[data-tool-name=vertices]').trigger('mouseover', 'bottomLeft', { force: true });
    cy.get('.joint-marker-vertex').should('be.visible');
  });

  it('persist boundary event with sequence flow in XML', () => {
    uploadXml('../fixtures/boundaryEvent.xml');

    const sequenceFlowXML = '<bpmn:sequenceFlow id="node_5" name="New Sequence Flow" sourceRef="node_3" targetRef="node_2" pm:startEvent="" />';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => removeIndentationAndLinebreaks(xml))
      .then(xml => expect(xml).to.contain(sequenceFlowXML));
  });

  it('scales mini-map on load', function() {
    cy.get('[data-test=mini-map-btn]').click();
    uploadXml('../fixtures/offscreenProcess.xml');
    cy.get('.mini-paper .joint-cell')
      .each($cell => {
        cy.wrap($cell).should('be.visible');
      });
  });

  it('Scales gateways when mini-map is opened', function() {
    const gatewayPosition = { x: 400, y: 400 };
    dragFromSourceToDest(nodeTypes.parallelGateway, gatewayPosition);
    cy.get('[data-test=mini-map-btn]').click();

    cy.get('.mini-paper [data-type="processmaker.components.nodes.startEvent.Shape"]').then($startEvent => {
      const { width: startEventWidth, height: startEventHeight } = $startEvent.get(0).getBBox();
      cy.get('.mini-paper [data-type="processmaker.components.nodes.gateway.Shape"]').should($gateway => {
        const { width, height } = $gateway.get(0).getBBox();
        expect(width).to.be.closeTo(startEventWidth, 100);
        expect(height).to.be.closeTo(startEventHeight, 100);
      });
    });
  });

  it('Does not show cursor when done loading empty process', function() {
    const startEventPosition = { x: 150, y: 150 };

    getElementAtPosition(startEventPosition)
      .click()
      .then($startEvent => getCrownButtonForElement($startEvent, 'delete-button'))
      .click();

    uploadXml('../../../src/blank.bpmn');

    cy.get('body')
      .should('have.css', 'cursor', 'auto')
      .should('not.have.css', 'cursor', 'wait');

    cy.get('.paper-container').should('not.have.class', 'wait');
    cy.get('.paper-container .joint-paper').should('not.have.css', 'cursor', 'wait');
  });

  it('Hides element label on drag', function() {
    const startEventSelector = '.main-paper [data-type="processmaker.components.nodes.startEvent.Shape"]';
    const nonBreakingSpace = String.fromCharCode(160);
    const startEventLabelText = `Start${nonBreakingSpace}Event`;

    cy.get(startEventSelector).as('startEvent')
      .should('have.text', startEventLabelText)
      .find('>text')
      .should('have.css', 'display', 'block');

    cy.get('@startEvent')
      .trigger('mousedown')
      .then($startEvent => {
        waitToRenderAllShapes();
        cy.wrap($startEvent)
          .find('>text')
          .should('have.css', 'display', 'block');
      });

    cy.get('@startEvent')
      .trigger('mousemove', { clientX: 600, clientY: 600 })
      .find('>text')
      .should('have.css', 'display', 'none');

    cy.get('@startEvent')
      .trigger('mouseup')
      .find('>text')
      .should('have.css', 'display', 'block');

    const poolPosition = { x: 150, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);
    const poolSelector = '.main-paper [data-type="processmaker.modeler.bpmn.pool"]';

    cy.get(poolSelector)
      .trigger('mousedown')
      .trigger('mousemove', { clientX: 580, clientY: 580 })
      .then(() => waitToRenderAllShapes())
      .get('@startEvent')
      .find('>text')
      .should('have.css', 'display', 'block');
  });

  it('can collapse the controls panel', () => {
    cy.get('[data-test=controls-column]').should('not.have.class', 'controls-column-compressed');

    cy.get('[data-test="panels-btn"]').click();
    cy.get('[data-test=controls-column]').should('have.class', 'controls-column-compressed');
  });

  it('can expand the controls panel', () => {
    cy.get('[data-test="panels-btn"]').click();
    cy.get('[data-test="panels-btn"]').click();

    cy.get('[data-test=controls-column]').should('not.have.class', 'controls-column-compressed');
  });

  it('can collapse inspector panel', () => {
    cy.get('[data-test=inspector-column]').should('not.have.class', 'inspector-column-compressed');

    cy.get('[data-test="panels-btn"]').click();
    cy.get('[data-test=inspector-column]').should('have.class', 'inspector-column-compressed');
  });

  it('can expand inspector panel', () => {
    cy.get('[data-test="panels-btn"]').click();

    cy.get('[data-test="panels-btn"]').click();
    cy.get('[data-test=inspector-column]').should('not.have.class', 'inspector-column-compressed');
  });

  it('can drag elements into collapsed inspector panel space', function() {
    const taskPosition = { x: 745, y: 200 };
    cy.get('[data-test=panels-btn]').click();
    cy.wait(700);
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    getElementAtPosition({ x: taskPosition.x + 5, y: taskPosition.y }).
      click().
      getType().
      should('equal', nodeTypes.task);
  });
});
