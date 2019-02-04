// const mountVue = require('cypress-vue-unit-test');
// import ModelerApp from '../../../src/ModelerApp';

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

function dragFromSourceToDest(source, dest, positionX, positionY){
  const dataTransfer = new DataTransfer();
  cy.get(`[data-test=${ source }]`).trigger('dragstart', { dataTransfer });
  cy.get(dest).trigger('dragenter', { force: true });
  cy.get(dest).trigger('drop', positionX, positionY);
}

function generateRandomPoint() {
  return Math.floor(Math.random() * 500) + 150;
}

function typeIntoTextInput(selector, value) {
  cy.wait(500);
  cy.get(selector).focus().clear().type(value, {force: true});
  cy.wait(500);
}

function connectNode(source, postionX, positionY) {
  cy.get(source).click().trigger('mousemove', { x: postionX, y: positionY, force: true});
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
        generateRandomPoint(),
        generateRandomPoint(),
      );
    });
    cy.get('.modeler').children().should('have.length', emptyChildrenCount + nodeTypes.length);
  });

  it('Can top and bottom lane', () => {
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
      { x: generateRandomPoint(), y: generateRandomPoint()},
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
      { x: generateRandomPoint(), y: generateRandomPoint()},
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
      { x: generateRandomPoint(), y: generateRandomPoint()},
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
      { x: generateRandomPoint(), y: generateRandomPoint()},
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

    connectNode(taskConnectorSelector, 300, 350);
    cy.get(taskSelectorTwo).click({force: true});
    typeIntoTextInput('[name=\'name\']', testString);

    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      { x: 100, y: 350},
    );

    connectNode(taskConnectorSelectorTwo, 100, 350);
    cy.get(taskSelectorThree).click({force: true});
    typeIntoTextInput('[name=\'name\']', testString);

    dragFromSourceToDest(
      'processmaker-modeler-end-event',
      '.paper-container',
      { x: 100, y: 500},
    );

    connectNode(taskConnectorSelectorThree, 100, 500);
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
});
