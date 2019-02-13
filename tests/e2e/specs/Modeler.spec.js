import { direction } from '../../../src/components/nodes/association/associationConfig';
import {
  dragFromSourceToDest,
  getElementAtPosition,
  getCrownButtonForElement,
  getGraphElements,
  getLinksConnectedToElement,
} from '../support/utils';

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
</bpmn:definitions>`;
};

function typeIntoTextInput(selector, value) {
  cy.wait(500);
  cy.get(selector).focus().clear().type(value, {force: true});
  cy.wait(500);
}

function connectNode(source, postionX, positionY) {
  cy.get(source).click({ force: true }).trigger('mousemove', { x: postionX, y: positionY, force: true});
}

function connectNodesWithSequenceFlow(startPosition, endPosition) {
  getElementAtPosition(startPosition)
    .click()
    .then($element => {
      getCrownButtonForElement($element, 'sequence-flow-button').click();
    })
    .then(() => {
      getElementAtPosition(endPosition)
        .trigger('mousemove')
        .click({ force: true });
    });
}

function connectNodesWithAssociationFlow(startPosition, endPosition) {
  getElementAtPosition(startPosition)
    .click()
    .then($element => {
      getCrownButtonForElement($element, 'association-flow-button').click();
    })
    .then(() => {
      getElementAtPosition(endPosition)
        .trigger('mousemove')
        .click();
    });
}

function waitToRenderAllShapes() {
  cy.wait(100);
}

const nodeTypes = [
  'processmaker-modeler-task',
  'processmaker-modeler-end-event',
  'processmaker-modeler-script-task',
  'processmaker-modeler-exclusive-gateway',
  'processmaker-modeler-text-annotation',
  'processmaker-modeler-pool',
];

describe('Modeler', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Renders the application without errors', () => {
    cy.get('.navbar').should('contain', 'ProcessMaker Modeler');
  });

  it('Renders list of nodes', () => {
    const emptyChildrenCount = 2;

    cy.get('.modeler').children().should('have.length', emptyChildrenCount);

    nodeTypes.forEach(type => {
      dragFromSourceToDest(
        type,
        '.paper-container',
        200, 200
      );
    });
    cy.get('.modeler').children().should('have.length', emptyChildrenCount + nodeTypes.length);
  });

  it('Can add top and bottom lane', () => {
    const poolPosition = { x: 200, y: 200 };

    dragFromSourceToDest(
      'processmaker-modeler-pool',
      '.paper-container',
      poolPosition,
    );

    waitToRenderAllShapes();

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-above-button').click();
        getCrownButtonForElement($pool, 'lane-below-button').click();
      });

  });

  it('Update task name', () => {
    const testString = 'testing';

    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      200, 200
    );

    cy.get('.joint-viewport').find('.joint-type-processmaker-components-nodes-task').click({force: true});
    typeIntoTextInput('[name=\'name\']', testString);
    cy.get('[name=\'name\']').should('have.value', testString);
  });

  it('Update exclusive gateway name', () => {
    const testString = 'testing';

    dragFromSourceToDest(
      'processmaker-modeler-exclusive-gateway',
      '.paper-container',
      200, 200
    );

    cy.get('.joint-viewport').find('.joint-type-processmaker-modeler-bpmn-exclusivegateway').click({force: true});
    typeIntoTextInput('[name=\'name\']', testString);
    cy.get('[name=\'name\']').should('have.value', testString);
  });

  it('Update text annotation name', () => {
    const testString = 'testing';

    dragFromSourceToDest(
      'processmaker-modeler-text-annotation',
      '.paper-container',
      200, 200
    );

    cy.get('.joint-viewport').find('.joint-type-standard-polyline').click({force: true});
    typeIntoTextInput('[name=\'text\']', testString);
    cy.get('[name=\'text\']').should('have.value', testString);
  });

  it('Update pool name', () => {
    const testString = 'testing';

    dragFromSourceToDest(
      'processmaker-modeler-pool',
      '.paper-container',
      200, 200
    );

    cy.get('.joint-viewport').find('.joint-type-processmaker-modeler-bpmn-pool').click({force: true});
    typeIntoTextInput('[name=\'name\']', testString);
    cy.get('[name=\'name\']').should('have.value', testString);
  });

  it('Create a simple process', () => {
    /* Only the initial start element should exist */
    const initialNumberOfElements = 1;

    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    const taskPosition = { x: 300, y: 200 };
    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      taskPosition,
    );

    const startEventPosition = { x: 150, y: 150 };
    connectNodesWithSequenceFlow(startEventPosition, taskPosition);

    const task2Position = { x: 300, y: 350 };
    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      task2Position,
    );
    connectNodesWithSequenceFlow(taskPosition, task2Position);

    const task3Position = { x: 100, y: 350 };
    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      task3Position,
    );
    connectNodesWithSequenceFlow(task2Position, task3Position);

    const endEventPosition = { x: 100, y: 500 };
    dragFromSourceToDest(
      'processmaker-modeler-end-event',
      '.paper-container',
      endEventPosition,
    );
    connectNodesWithSequenceFlow(task3Position, endEventPosition);

    dragFromSourceToDest(
      'processmaker-modeler-pool',
      '.paper-container',
      { x: 100, y: 100 },
    );

    waitToRenderAllShapes();

    const numberOfNewElementsAdded = 9;
    getGraphElements().should('have.length', initialNumberOfElements + numberOfNewElementsAdded);
  });

  it('Change direction of association to none, one and both', () => {
    const directionSelectSelector = '[name=\'associationDirection\']';
    const testDirection = {
      none:`${ direction.none }`,
      one: `${ direction.one }`,
      both:`${ direction.both }`,
    };

    const textAnnotationPosition = { x: 400, y: 100 };
    dragFromSourceToDest(
      'processmaker-modeler-text-annotation',
      '.paper-container',
      textAnnotationPosition,
    );

    const taskPosition = { x: 400, y: 300 };
    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      taskPosition,
    );

    connectNodesWithAssociationFlow(textAnnotationPosition, taskPosition);

    getElementAtPosition(textAnnotationPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click();

    cy.get(directionSelectSelector).select('none');
    cy.get(directionSelectSelector).should('have.value', testDirection.none);

    cy.get(directionSelectSelector).select('one');
    cy.get(directionSelectSelector).should('have.value', testDirection.one);

    cy.get(directionSelectSelector).select('both');
    cy.get(directionSelectSelector).should('have.value', testDirection.both);
  });

  it('Updates element name and validates xml', () => {
    const testString = 'testing';

    cy.get('.modeler').children().should('have.length', 2);
    cy.get('.joint-viewport').click();
    cy.get('[name=\'name\']').focus().clear().type(testString);
    cy.get('.joint-viewport').contains(testString);

    cy.get('[data-test="downloadXMLBtn"]').click();
    const validXML = generateXML(testString);
    cy.window().its('xml').then(xml => xml.trim()).should('eq', validXML.trim());
  });

  it('Prevent element to connect to self', () => {
    /* Only the initial start element should exist */
    const initialNumberOfElements = 1;

    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    const taskPosition = { x: 400, y: 300 };
    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      taskPosition
    );
    waitToRenderAllShapes();

    connectNodesWithSequenceFlow(taskPosition, taskPosition);

    const numberOfNewElementsAdded = 1;
    getGraphElements().should('have.length', initialNumberOfElements + numberOfNewElementsAdded);
  });
});
