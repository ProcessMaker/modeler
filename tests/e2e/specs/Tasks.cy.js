import {
  addNodeTypeToPaper,
  clickAndDropElement,
  getElementAtPosition, modalAnimationTime,
  modalCancel,
  modalConfirm,
  toggleInspector,
  typeIntoTextInput, waitForAnimations,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Tasks', () => {
  const taskPosition = { x: 350, y: 250 };
  const testString = 'testing';

  beforeEach(() => {
    toggleInspector();
  });

  it('Update task name', () => {
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });
  it('Update task element destination', () => {
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).click();

    // Task source (default)
    cy.get('[data-test=element-destination-type]').should('exist');
    cy.get('[data-test=element-destination-type]').click();
    cy.get('[id=option-1-0]').click();
    cy.get('[class=multiselect__single]').should('exist');
    cy.get('[class=multiselect__single]').contains('Task Source (Default)');
    cy.get('[data-test=dashboard]').should('not.exist');
    cy.get('[data-test=external-url]').should('not.exist');

    // Process Launchpad
    cy.get('[data-test=element-destination-type]').should('exist');
    cy.get('[data-test=element-destination-type]').click();
    cy.get('[id=option-1-2]').click();
    cy.get('[class=multiselect__single]').should('exist');
    cy.get('[class=multiselect__single]').contains('Process Launchpad');
    cy.get('[data-test=dashboard]').should('not.exist');
    cy.get('[data-test=external-url]').should('not.exist');

    // Process Launchpad
    cy.get('[data-test=element-destination-type]').should('exist');
    cy.get('[data-test=element-destination-type]').click();
    cy.get('[id=option-1-3]').click();
    cy.get('[class=multiselect__single]').should('exist');
    cy.get('[class=multiselect__single]').contains('Welcome Dashboard');
    cy.get('[data-test=dashboard]').should('not.exist');
    cy.get('[data-test=external-url]').should('not.exist');

    // Custom Dashboard
    cy.get('[data-test=element-destination-type]').should('exist');
    cy.get('[data-test=element-destination-type]').click();
    cy.get('[id=option-1-4]').click();
    cy.get('[class=multiselect__single]').should('exist');
    cy.get('[class=multiselect__single]').contains('Custom Dashboard');
    cy.get('[data-test=dashboard]').should('exist');
    cy.get('[data-test=external-url]').should('not.exist');

    // Custom Dashboard
    cy.get('[data-test=element-destination-type]').should('exist');
    cy.get('[data-test=element-destination-type]').click();
    cy.get('[id=option-1-5]').click();
    cy.get('[class=multiselect__single]').should('exist');
    cy.get('[class=multiselect__single]').contains('External URL');
    cy.get('[data-test=dashboard]').should('not.exist');
    cy.get('[data-test=external-url]').should('exist');
    cy.get('[data-test=downloadXMLBtn]').click();
    const validXML = '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:pm="http://processmaker.com/BPMN/2.0/Schema.xsd" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0">\n  <bpmn:process id="Process_1" isExecutable="true">\n    <bpmn:startEvent id="node_1" name="Start Event" />\n    <bpmn:task id="node_2" name="Form Task" pm:assignment="requester" pm:elementDestination="{&#34;type&#34;:&#34;externalURL&#34;,&#34;value&#34;:null}" />\n  </bpmn:process>\n  <bpmndi:BPMNDiagram id="BPMNDiagram_1">\n    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">\n      <bpmndi:BPMNShape id="node_1_di" bpmnElement="node_1">\n        <dc:Bounds x="150" y="210" width="36" height="36" />\n      </bpmndi:BPMNShape>\n      <bpmndi:BPMNShape id="node_2_di" bpmnElement="node_2">\n        <dc:Bounds x="340" y="310" width="116" height="76" />\n      </bpmndi:BPMNShape>\n    </bpmndi:BPMNPlane>\n  </bpmndi:BPMNDiagram>\n</bpmn:definitions>';

    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('eq', validXML.trim());
  });
  
  it('Correctly renders task after undo/redo', () => {
    clickAndDropElement(nodeTypes.task, taskPosition);
    cy.wait(500);

    cy.get('[data-cy="undo-control"]').click();
    cy.wait(500);
    cy.get('[data-cy="redo-control"]').click();
    cy.wait(500);

    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.task);
  });

  it('Should not display modal when switching task type when *initially* added', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');
    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
  });

  it('Can keep the name when switching task type', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');
    typeIntoTextInput('[name=name]', testString);

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
    cy.get('[data-test="select-type-dropdown"]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    cy.wait(modalAnimationTime);
    modalConfirm();
    waitForAnimations();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.manualTask);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Should display modal to switch task type *after* initially added', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');

    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    cy.wait(modalAnimationTime);

    cy.get('#modal-prevent-closing').should('be.visible').and('contain.text', 'Changing this type will replace your current configuration');

    modalConfirm();
    waitForAnimations();
    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.manualTask);
  });

  it('Does not switch task type if canceled', () => {
    addNodeTypeToPaper(taskPosition, nodeTypes.task, 'switch-to-sub-process');

    getElementAtPosition({ x: 210, y: 200 }).click();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-manual-task]').click();
    modalCancel();
    waitForAnimations();

    getElementAtPosition(taskPosition).click().getType().should('equal', nodeTypes.subProcess);
  });
});
