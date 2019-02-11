import { direction } from '../../../src/components/nodes/association/associationConfig';

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

function dragFromSourceToDest(source, dest, position) {
  const dataTransfer = new DataTransfer();
  cy.get(`[data-test=${ source }]`).trigger('dragstart', { dataTransfer });
  cy.get(dest).trigger('dragenter', { force: true });
  cy.get(dest).trigger('drop', { x: position.x, y: position.y });
}

function typeIntoTextInput(selector, value) {
  cy.wait(500);
  cy.get(selector).focus().clear().type(value, {force: true});
  cy.wait(500);
}

function connectNode(source, postionX, positionY) {
  cy.get(source).click({ force: true }).trigger('mousemove', { x: postionX, y: positionY, force: true});
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
    cy.visit('/');
    cy.reload();
    cy.viewport(1280, 720);
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
    const poolSelector = '#v-24';
    const topLaneSeletor = '#v-26';
    const bottomLaneSeletor = '#v-29';

    dragFromSourceToDest(
      'processmaker-modeler-pool',
      '.paper-container',
      { x: 100, y: 100},
    );
    cy.get(poolSelector).click();
    cy.get(topLaneSeletor).click({ force: true });
    cy.get(bottomLaneSeletor).click({ force: true });

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
    const startEventSelector = '#v-11';
    const startEventConnectorSelector = '#v-14';
    const taskSelector = '#v-23';
    const taskConnectorSelector = '#v-26';
    const taskSelectorTwo = '#v-47';
    const taskConnectorSelectorTwo = '#v-50';
    const taskSelectorThree = '#v-68';
    const taskConnectorSelectorThree = '#v-71';
    const endEventSelector = '#v-85';
    const poolSelector = '#v-101';
    const testString = 'testing';
    const emptyChildrenCount = 2;

    cy.get('.modeler').children().should('have.length', emptyChildrenCount);

    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      { x: 300, y: 200},
    );

    cy.get(startEventSelector).click();
    typeIntoTextInput('[name=\'name\']', testString);
    connectNode(startEventConnectorSelector, 350, 250);
    cy.get(taskSelector).click({ force: true });
    typeIntoTextInput('[name=\'name\']', testString);

    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      { x: 300, y: 350},
    );

    connectNode(taskConnectorSelector, 350, 400);
    cy.get(taskSelectorTwo).click({force: true});
    typeIntoTextInput('[name=\'name\']', testString);

    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      { x: 100, y: 350},
    );

    connectNode(taskConnectorSelectorTwo, 150, 400);
    cy.get(taskSelectorThree).click({force: true});
    typeIntoTextInput('[name=\'name\']', testString);

    dragFromSourceToDest(
      'processmaker-modeler-end-event',
      '.paper-container',
      { x: 100, y: 500},
    );

    connectNode(taskConnectorSelectorThree, 110, 510);
    cy.get(endEventSelector).click();

    dragFromSourceToDest(
      'processmaker-modeler-pool',
      '.paper-container',
      { x: 100, y: 100 },
    );

    cy.get(poolSelector).click();
    typeIntoTextInput('[name=\'name\']', testString);

    cy.get('[data-test="downloadXMLBtn"]').click();
    cy.get('.modeler').children().should('have.length', 11);
  });

  it('Change direction of association to none, one and both', () => {
    const textAnnotation = '#j_4';
    const associationButton = '#v-25';
    const associationNode = '#v-56';
    const directionSelectSelector = '[name=\'associationDirection\']';

    const testDirection = {
      none:`${ direction.none }`,
      one: `${ direction.one }`,
      both:`${ direction.both }`,
    };

    dragFromSourceToDest(
      'processmaker-modeler-text-annotation',
      '.paper-container',
      { x: 400, y: 100 },
    );

    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      { x: 400, y: 300 },
    );

    cy.get(textAnnotation).click();
    cy.get(associationButton).click();
    connectNode(associationButton, 400, 300);
    cy.get(associationNode).click();

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
    const taskCoordinates = { x: 400, y: 300 };
    const taskSelector = '#v-23';
    const connectorSelector = '#v-26';
    const emptyChildrenCount = 2;
    const finalElementCount = 3;

    cy.get('.modeler').children().should('have.length', emptyChildrenCount);

    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      taskCoordinates
    );

    cy.get(taskSelector).click({ force: true });
    connectNode(connectorSelector, 400, 300);
    cy.get(taskSelector).click({ force: true });
    cy.get('.modeler').children().should('have.length', finalElementCount);
  });
});
