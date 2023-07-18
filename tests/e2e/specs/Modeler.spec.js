import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsSubstringNTimes,
  connectNodesWithFlow,
  clickAndDropElement,
  getCrownButtonForElement,
  getElementAtPosition,
  getGraphElements,
  getLinksConnectedToElement,
  isElementCovered,
  removeIndentationAndLinebreaks,
  typeIntoTextInput,
  uploadXml,
  waitToRenderAllShapes,
  toggleInspector,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Modeler', { scrollBehavior: false }, () => {
  it('Create a simple process', () => {
    /* Only the initial start element should exist */
    const initialNumberOfElements = 1;

    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    const taskPosition = { x: 350, y: 200 };
    clickAndDropElement(nodeTypes.task, taskPosition);

    const startEventPosition = { x: 210, y: 200 };
    connectNodesWithFlow('generic-flow-button', startEventPosition, taskPosition);

    const task2Position = { x: 350, y: 350 };
    clickAndDropElement(nodeTypes.task, task2Position);
    connectNodesWithFlow('generic-flow-button', taskPosition, task2Position);

    const task3Position = { x: 500, y: 350 };
    clickAndDropElement(nodeTypes.task, task3Position);
    connectNodesWithFlow('generic-flow-button', task2Position, task3Position);

    const endEventPosition = { x: 210, y: 500 };
    clickAndDropElement(nodeTypes.endEvent, endEventPosition);
    connectNodesWithFlow('generic-flow-button', task3Position, endEventPosition);

    clickAndDropElement(nodeTypes.pool, { x: 200, y: 100 });

    const numberOfNewElementsAdded = 9;
    getGraphElements().should('have.length', initialNumberOfElements + numberOfNewElementsAdded);
  });

  it('Updates element name and validates xml', () => {
    waitToRenderAllShapes();

    const startEventPosition = { x: 210, y: 200 };
    getElementAtPosition(startEventPosition).click();

    toggleInspector();
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
        <dc:Bounds x="210" y="200" width="36" height="36" />
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
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    connectNodesWithFlow('generic-flow-button', taskPosition, taskPosition);

    const numberOfNewElementsAdded = 1;
    getGraphElements().should('have.length', initialNumberOfElements + numberOfNewElementsAdded);
  });

  it('Generates sequential, unique node IDs', { scrollBehavior: 'bottom'}, () => {
    toggleInspector();
    waitToRenderAllShapes();

    const startEventPosition = { x: 210, y: 200 };
    getElementAtPosition(startEventPosition).click();

    cy.get('[name=id] input').should('have.value', 'node_1');

    const taskPosition = { x: 350, y: 200 };
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).click();
    cy.contains('Advanced').click();

    cy.get('[name=id] input').should('have.value', 'node_2');

    typeIntoTextInput('[name=id] input', 'node_3');

    const task2Position = { x: 250, y: 350 };
    clickAndDropElement(nodeTypes.task, task2Position);
    waitToRenderAllShapes();
    getElementAtPosition(task2Position).click();

    cy.contains('Advanced').click();
    typeIntoTextInput('[name=id] input', 'node_4');
    cy.get('[name=id] input').should('have.value', 'node_4');

    const task3Position = { x: 400, y: 350 };
    clickAndDropElement(nodeTypes.task, task3Position);
    waitToRenderAllShapes();
    getElementAtPosition(task3Position).click();

    cy.contains('Advanced').click();
    typeIntoTextInput('[name=id] input', 'node_5');
    cy.get('[name=id] input').should('have.value', 'node_5');

    uploadXml('../../../src/blank.bpmn');

    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).click();

    cy.contains('Advanced').click();
    typeIntoTextInput('[name=id] input', 'node_1');
    cy.get('[name=id] input').should('have.value', 'node_1');
  });

  it('Check node ID is unique', { scrollBehavior: 'bottom' }, () => {
    toggleInspector();
    waitToRenderAllShapes();

    const startEventPosition = { x: 210, y: 200 };
    getElementAtPosition(startEventPosition).click();

    cy.get('[name=id] input').should('have.value', 'node_1');

    const taskPosition = { x: 350, y: 300 };
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).click();
    cy.contains('Advanced').click();

    cy.get('[name=id] input').should('have.value', 'node_2');

    getElementAtPosition(startEventPosition).click();
    cy.contains('Advanced').click();
    typeIntoTextInput('[name=id] input', 'node_2');

    cy.get('#collapse-advanced-accordion')
      .should('contain.text', 'Must be unique');

    typeIntoTextInput('[name=id] input', 'node_3');

    cy.get('#collapse-advanced-accordion')
      .should('not.contain.text', 'Must be unique');

    getElementAtPosition(taskPosition).click();
    cy.contains('Advanced').click();
    typeIntoTextInput('[name=id] input', 'node_3');

    cy.get('#collapse-advanced-accordion')
      .should('contain.text', 'Must be unique');

    typeIntoTextInput('[name=id] input', 'node_2');

    cy.get('#collapse-advanced-accordion')
      .should('not.contain.text', 'Must be unique');
  });

  it('Adding a pool and lanes does not overlap sequence flow', () => {
    const startEventPosition = { x: 210, y: 200 };
    const taskPosition = { x: 350, y: 250 };

    clickAndDropElement(nodeTypes.task, taskPosition);

    connectNodesWithFlow('generic-flow-button', startEventPosition, taskPosition);

    const poolPosition = { x: 180, y: 200 };
    clickAndDropElement(nodeTypes.pool, poolPosition);

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
    const startEventPosition = { x: 210, y: 200 };
    getElementAtPosition(startEventPosition).click();
    cy.get('[data-test=inspector-container]').should('to.contain', 'Enter the name of this element');

    getElementAtPosition(startEventPosition)
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click();
      });

    waitToRenderAllShapes();

    cy.get('[data-test=inspector-container]').should('to.not.contain', 'Enter the name of this element');
    cy.get('[data-test=inspector-container]').should('to.contain', 'Process');
  });

  it('Runs custom parser before default parser', () => {
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

  it('check if process id is a valid QName', () => {
    toggleInspector();
    cy.get('.paper-container').click();

    cy.get('[name=id]').clear();

    const invalidId = '12 id!';
    typeIntoTextInput('[name=id]', invalidId);

    cy.get('.invalid-feedback').should('contain', 'The Node Identifier format is invalid.');

    const validId = 'Process_1';
    typeIntoTextInput('[name=id]', validId);

    cy.get('.invalid-feedback').should('not.exist');
  });

  it('shows warning for unknown element during parsing', () => {
    uploadXml('unknownElement.xml');
    const warning = 'bpmn:Group is an unsupported element type in parse';

    cy.get('[data-cy="validate-button"]').click({ force: true });
    cy.get('[data-cy="validate-issue-button"]').click({ force: true });
    cy.get('[data-cy="validate-panel"]').should('contain', warning);
  });

  it('shows warning for non-default base element during parsing', () => {
    uploadXml('nonDefaultBaseElement.xml');
    const warning = 'bpmn:IntermediateCatchEvent is an unsupported element type in parse';

    cy.get('[data-cy="validate-button"]').click({ force: true });
    cy.get('[data-cy="validate-issue-button"]').click({ force: true });
    cy.get('[data-cy="validate-panel"]').should('contain', warning);

    getGraphElements().should('have.length', 0);
  });

  it('check for joint marker class on linkTools', () => {
    const startEventPosition = { x: 210, y: 200 };
    const taskPosition = { x: 350, y: 300 };

    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    connectNodesWithFlow('generic-flow-button', startEventPosition, taskPosition);

    getElementAtPosition(startEventPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click('topRight', { force: true });

    cy.get('[data-tool-name=vertices]').trigger('mousedown', 'topRight');
    cy.get('[data-tool-name=vertices]').trigger('mousemove', 'bottomLeft', { force: true });
    cy.get('[data-tool-name=vertices]').trigger('mouseup', 'bottomLeft', { force: true });
    cy.get('[data-tool-name=vertices]').trigger('mouseover', 'bottomLeft', { force: true });
    cy.get('.joint-marker-vertex').should('be.visible');
  });

  it('persist boundary event with sequence flow in XML', () => {
    uploadXml('../fixtures/boundaryEvent.xml');

    const sequenceFlowXML = '<bpmn:sequenceFlow id="node_5" name="Sequence Flow" sourceRef="node_3" targetRef="node_2" />';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => removeIndentationAndLinebreaks(xml))
      .then(xml => expect(xml).to.contain(sequenceFlowXML));
  });

  it('scales mini-map on load', () => {
    cy.get('[data-cy="mini-paper-button"]').click({ multiple: true });

    uploadXml('../fixtures/offscreenProcess.xml');
    cy.get('.mini-paper .joint-cell')
      .each($cell => {
        cy.wrap($cell).should('be.visible');
      });
  });

  it('Scales gateways when mini-map is opened', () => {
    const gatewayPosition = { x: 400, y: 400 };
    addNodeTypeToPaper(gatewayPosition, nodeTypes.exclusiveGateway, 'switch-to-parallel-gateway');
    cy.get('[data-cy="mini-paper-button"]').click({ multiple: true });

    cy.get('.mini-paper [data-type="processmaker.components.nodes.startEvent.Shape"]').then($startEvent => {
      const { width: startEventWidth, height: startEventHeight } = $startEvent.get(0).getBBox();
      cy.get('.mini-paper [data-type="processmaker.components.nodes.gateway.Shape"]').should($gateway => {
        const { width, height } = $gateway.get(0).getBBox();
        expect(width).to.be.closeTo(startEventWidth, 100);
        expect(height).to.be.closeTo(startEventHeight, 100);
      });
    });
  });

  it('Does not show cursor when done loading empty process', () => {
    const startEventPosition = { x: 210, y: 200 };

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

  it('Hides element label on drag', () => {
    const startEventSelector = '.main-paper [data-type="processmaker.components.nodes.startEvent.Shape"]';
    const nonBreakingSpace = String.fromCharCode(160);
    const startEventLabelText = `Start${nonBreakingSpace}Event`;

    cy.get(startEventSelector).as('startEvent')
      .should('have.text', startEventLabelText)
      .find('>text')
      .should('have.css', 'display', 'block');

    cy.get('@startEvent')
      .click()
      .trigger('mouseover')
      .trigger('mousedown', { which: 1, force: true })
      .then($startEvent => {
        waitToRenderAllShapes();
        cy.wrap($startEvent)
          .find('>text')
          .should('have.css', 'display', 'block');
      });

    cy.get('@startEvent')
      .trigger('mousemove', { clientX: 600, clientY: 600, force: true })
      .trigger('mousemove', { clientX: 600, clientY: 600, force: true })
      .then($startEvent => {
        waitToRenderAllShapes();
        cy.wrap($startEvent)
          .find('>text')
          .should('have.css', 'display', 'none');
      });

    cy.get('@startEvent')
      .trigger('mouseup')
      .find('>text')
      .should('have.css', 'display', 'block');

    const poolPosition = { x: 200, y: 300 };
    clickAndDropElement(nodeTypes.pool, poolPosition);
    waitToRenderAllShapes();
    const poolSelector = '.main-paper [data-type="processmaker.modeler.bpmn.pool"]';

    cy.get(poolSelector)
      .click({ force: true })
      .trigger('mouseover', { force: true })
      .trigger('mousedown', { which: 1, force: true })
      .trigger('mousemove', { clientX: 580, clientY: 580, force: true })
      .trigger('mousemove', { clientX: 580, clientY: 580, force: true })
      .then(() => waitToRenderAllShapes())
      .get('@startEvent')
      .find('>text')
      .should('have.css', 'display', 'block');
  });

  it('can drag elements into collapsed inspector panel space', () => {
    const taskPosition = { x: 745, y: 200 };
    cy.wait(700);
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    getElementAtPosition({ x: taskPosition.x + 5, y: taskPosition.y }).click({ force: true }).getType()
      .should('equal', nodeTypes.task);
  });

  it('should not generate duplicate diagram IDs', () => {
    uploadXml('setUpForDuplicateDiagramId.xml');
    clickAndDropElement(nodeTypes.task, { x: 400, y: 300 });
    waitToRenderAllShapes();
    assertDownloadedXmlContainsSubstringNTimes('node_1_di',1,'Node 1 should occur once');
    assertDownloadedXmlContainsSubstringNTimes('node_2_di',1,'Node 2 should occur once');
  });

  it('should only show dropdown for the start event', () => {
    const startEventPosition = { x: 400, y: 400 };
    clickAndDropElement(nodeTypes.startEvent, startEventPosition);
    waitToRenderAllShapes();
    getElementAtPosition(startEventPosition, nodeTypes.startEvent).click();

    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-start-timer-event]').should('exist');
    cy.get('[data-test=switch-to-message-start-event]').should('exist');

    clickAndDropElement(nodeTypes.task, { x: 300, y: 300 });

    cy.get('[data-test=switch-to-start-timer-event]').should('not.exist');
    cy.get('[data-test=switch-to-message-start-event]').should('not.exist');
  });

  it('should hide start event dropdown on unhighlight', () => {
    const startEventPosition = { x: 400, y: 400 };
    clickAndDropElement(nodeTypes.startEvent, startEventPosition);
    waitToRenderAllShapes();
    getElementAtPosition(startEventPosition, nodeTypes.startEvent).click();
    cy.get('.paper-container').click();
    getElementAtPosition(startEventPosition, nodeTypes.startEvent).click();

    cy.get('[data-test=switch-to-start-timer-event]').should('not.exist');
    cy.get('[data-test=switch-to-message-start-event]').should('not.exist');
  });

  it('can render a file with non-existent element', () => {
    uploadXml('non-existent-element.xml');

    cy.get('[data-cy="validate-button"]').click({ force: true });
    cy.get('[data-cy="validate-issue-button"]').click({ force: true });
    cy.get('[data-cy="validate-panel"]').should($list => {
      expect($list).to.contain('references a non-existent element and was not parsed');
    });
  });

  it('after collapsing panels, show inspector panel when element is highlighted', () => {
    cy.get('[data-test="inspector-container"]').should('not.be.visible');

    const startEventPosition = { x: 210, y: 200 };
    getElementAtPosition(startEventPosition).click();
    toggleInspector();
    cy.get('[data-test="inspector-container"]').should('be.visible');

    toggleInspector();
    cy.get('[data-test="inspector-container"]').should('not.be.visible');
  });

  it('should hide the crown when adding a sequence flow', () => {
    cy.get('.paper-container').click();
    cy.get('.crown-config').should('not.exist');

    const startEventPosition = { x: 210, y: 200 };
    getElementAtPosition(startEventPosition).click();
    cy.get('.crown-config').should('exist');

    cy.get('#generic-flow-button').click();
    cy.get('.crown-config').should('not.exist');
  });
});
