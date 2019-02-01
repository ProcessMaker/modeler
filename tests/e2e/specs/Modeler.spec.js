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

const dragFromSourceToDest = (source, dest, position) => {
  const dataTransfer = new DataTransfer();
  cy.get(source).trigger('dragstart', { dataTransfer });
  cy.get(dest).trigger('dragenter');
  cy.get(dest).trigger('drop', { offsetX: position.x, offsetY: position.y });
};

function coordinateGenerator() {
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

    cy.get('.modeler').children().should('have.length', 2);

    dragFromSourceToDest(
      '.processmaker-modeler-task',
      '.paper-container',
      { x: 300, y: 200},
    );

    cy.get(startEventSelector).click();
    typeIntoTextInput('[name=\'name\']', 'testing');
    connectNode(startEventConnectorSelector, 300, 200);

    cy.get(taskSelector).click({ force: true });
    typeIntoTextInput('[name=\'name\']', 'testing');

    dragFromSourceToDest(
      '.processmaker-modeler-task',
      '.paper-container',
      { x: 300, y: 350},
    );

    connectNode(taskConnectorSelector, 300, 350);
    cy.get(taskSelectorTwo).click({force: true});
    typeIntoTextInput('[name=\'name\']', 'testing two');

    dragFromSourceToDest(
      '.processmaker-modeler-task',
      '.paper-container',
      { x: 100, y: 350},
    );

    connectNode(taskConnectorSelectorTwo, 100, 350);
    cy.get(taskSelectorThree).click({force: true});
    typeIntoTextInput('[name=\'name\']', 'testing three');

    dragFromSourceToDest(
      '.processmaker-modeler-end-event',
      '.paper-container',
      { x: 100, y: 500},
    );

    connectNode(taskConnectorSelectorThree, 100, 500);
    cy.get(endEventSelector).click();

    dragFromSourceToDest(
      '.processmaker-modeler-pool',
      '.paper-container',
      { x: 100, y: 100 },
    );

    cy.get(poolSelector).click();
    typeIntoTextInput('[name=\'name\']', 'testing pools');

    cy.get('[data-test="downloadXMLBtn"]').click();
    cy.get('.modeler').children().should('have.length', 11);
  });

  it('Renders list of nodes', () => {
    cy.get('.modeler').children().should('have.length', 2);

    nodeTypes.forEach(type => {
      dragFromSourceToDest(
        type,
        '.paper-container',
        { x: coordinateGenerator(), y: coordinateGenerator()},
      );
    });
    cy.get('.modeler').children().should('have.length', 8);
  });

  it('Update task name', ()=> {
    dragFromSourceToDest(
      '.processmaker-modeler-task',
      '.paper-container',
      { x: coordinateGenerator(), y: coordinateGenerator()},
    );

    cy.get('.joint-viewport').find('.joint-type-processmaker-components-nodes-task').click({force: true});
    cy.get('[name=\'name\']').focus().clear().type('testing', {force: true});
    cy.get('[name=\'name\']').should('have.value', 'testing');
  });

  it('Update exclusive gateway name', ()=> {
    dragFromSourceToDest(
      '.processmaker-modeler-exclusive-gateway',
      '.paper-container',
      { x: coordinateGenerator(), y: coordinateGenerator()},
    );

    cy.get('.joint-viewport').find('.joint-type-processmaker-modeler-bpmn-exclusivegateway').click({force: true});
    cy.get('[name=\'name\']').focus().clear().type('testing', {force: true});
    cy.get('[name=\'name\']').should('have.value', 'testing');
  });

  it('Update text annotation name', ()=> {
    dragFromSourceToDest(
      '.processmaker-modeler-text-annotation',
      '.paper-container',
      { x: coordinateGenerator(), y: coordinateGenerator()},
    );

    cy.get('.joint-viewport').find('.joint-type-standard-polyline').click({force: true});
    cy.get('[name=\'text\']').focus().clear().type('testing', {force: true});
    cy.get('[name=\'text\']').should('have.value', 'testing');
  });

  it('Update pool name', ()=> {
    dragFromSourceToDest(
      '.processmaker-modeler-pool',
      '.paper-container',
      { x: coordinateGenerator(), y: coordinateGenerator()},
    );

    cy.get('.joint-viewport').find('.joint-type-processmaker-modeler-bpmn-pool').click({force: true});
    cy.get('[name=\'name\']').focus().clear().type('testing', {force: true});
    cy.get('[name=\'name\']').should('have.value', 'testing');
  });

  it('Updates element name and validates xml', () => {
    cy.get('.modeler').children().should('have.length', 2);
    cy.get('.joint-viewport').click();
    cy.get('[name=\'name\']').focus().clear().type('testing');
    cy.get('.joint-viewport').contains('testing');

    cy.get('[data-test="downloadXMLBtn"]').click();
    const validXML = generateXML('testing');
    cy.window().its('xml').then(xml => xml.trim()).should('eq', validXML.trim());
  });
});
