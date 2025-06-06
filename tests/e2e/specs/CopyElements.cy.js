import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlContainsSubstringNTimes,
  clickAndDropElement,
  getElementAtPosition,
  modalConfirm,
  toggleInspector,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Copy element', { scrollBehavior: false }, () => {
  it('should copy start events', () => {
    const startEventPosition = { x: 210, y: 200 };

    getElementAtPosition(startEventPosition).click();
    cy.get('[data-test=copy-button]').click();

    cy.get('.paper-container').click('center', { force: true });
    cy.get('body').type('{ctrl}v');
    cy.get('body').type('{ctrl}v');

    const processWithTwoStartEventCopies = `
      <?xml version="1.0" encoding="UTF-8"?>
      <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0">
        <bpmn:process id="Process_1" isExecutable="true">
          <bpmn:startEvent id="node_1" name="Start Event" />
          <bpmn:startEvent id="node_2" name="Start Event" />
          <bpmn:startEvent id="node_3" name="Start Event" />
        </bpmn:process>
        <bpmndi:BPMNDiagram id="BPMNDiagram_1">
          <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
            <bpmndi:BPMNShape id="node_1_di" bpmnElement="node_1">
    `;

    assertDownloadedXmlContainsExpected(processWithTwoStartEventCopies);
  });

  it('should copy tasks', () => {
    const taskPosition = { x: 300, y: 250 };

    clickAndDropElement(nodeTypes.task, taskPosition);
    toggleInspector();

    getElementAtPosition(taskPosition).click();

    typeIntoTextInput('[name=name]', 'Test Name');
    typeIntoTextInput('[name=dueIn]', 45);
    cy.get('[name = assignedUsers]').select('John Smith');

    cy.get('[data-test=copy-button]').click();

    cy.get('.paper-container').click('center', { force: true });
    cy.get('body').type('{ctrl}v');
    cy.get('body').type('{ctrl}v');

    const processWithTwoStartEventCopies = `
      <bpmn:startEvent id="node_1" name="Start Event" />
      <bpmn:task id="node_2" name="Test Name" pm:dueIn="45" pm:assignment="requester" pm:assignedUsers="John Smith" pm:elementDestination="{&#34;type&#34;:&#34;taskSource&#34;,&#34;value&#34;:null}" />
      <bpmn:task id="node_27" name="Test Name" pm:dueIn="45" pm:assignment="requester" pm:assignedUsers="John Smith" pm:elementDestination="{&#34;type&#34;:&#34;taskSource&#34;,&#34;value&#34;:null}" />
      <bpmn:task id="node_29" name="Test Name" pm:dueIn="45" pm:assignment="requester" pm:assignedUsers="John Smith" pm:elementDestination="{&#34;type&#34;:&#34;taskSource&#34;,&#34;value&#34;:null}" />
    `;

    assertDownloadedXmlContainsExpected(processWithTwoStartEventCopies);
  });

  it('copies error on Error End Event', () => {
    const errorEndEventPosition = { x: 350, y: 250 };

    addNodeTypeToPaper(errorEndEventPosition, nodeTypes.endEvent, 'switch-to-error-end-event');
    waitToRenderAllShapes();

    cy.get('[data-test=copy-button]').click();
    cy.get('.paper-container').click('center', { force: true });
    cy.get('body').type('{ctrl}v');
    waitToRenderAllShapes();

    const process = `
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:startEvent id="node_1" name="Start Event" />
        <bpmn:endEvent id="node_3" name="Error End Event">
          <bpmn:errorEventDefinition errorRef="node_3_error" />
        </bpmn:endEvent>
        <bpmn:endEvent id="node_4" name="Error End Event">
          <bpmn:errorEventDefinition errorRef="node_4_error" />
        </bpmn:endEvent>
      </bpmn:process>
      <bpmn:error id="node_3_error" name="node_3_error" />
      <bpmn:error id="node_4_error" name="node_4_error" />
    `;

    assertDownloadedXmlContainsExpected(process);

  });

  it('copies message on Message Event', () => {
    const messageEndEventPosition = { x: 350, y: 250 };
    addNodeTypeToPaper(messageEndEventPosition, nodeTypes.endEvent, 'switch-to-message-end-event');
    waitToRenderAllShapes();

    cy.get('[data-test=copy-button]').click();

    cy.get('.paper-container').click('center', { force: true });
    cy.get('body').type('{ctrl}v');

    cy.get('[role="alert"]',{ timeout: 7000 }).should('not.exist');
    cy.get('[data-type="processmaker.components.nodes.endEvent.Shape"]').eq(0).click({ force:true });
    const intermediateMessageThrowEventPosition = { x: 600, y: 450 };
    clickAndDropElement(nodeTypes.intermediateCatchEvent, intermediateMessageThrowEventPosition);
    cy.get('[data-test=select-type-dropdown]').click();
    cy.get('[data-test=switch-to-intermediate-message-throw-event]').click();
    modalConfirm();
    cy.get('[data-test=copy-button]').click();

    cy.get('.paper-container').click('center', { force: true });
    cy.get('body').type('{ctrl}v');
    waitToRenderAllShapes();

    const process = `
      <bpmn:process id="Process_1" isExecutable="true">
        <bpmn:startEvent id="node_1" name="Start Event" />
        <bpmn:endEvent id="node_3" name="Message End Event">
          <bpmn:messageEventDefinition messageRef="node_3_message" />
        </bpmn:endEvent>
        <bpmn:endEvent id="node_4" name="Message End Event">
          <bpmn:messageEventDefinition messageRef="node_4_message" />
        </bpmn:endEvent>
        <bpmn:intermediateThrowEvent id="node_7" name="Intermediate Message Throw Event">
          <bpmn:messageEventDefinition messageRef="node_7_message" />
        </bpmn:intermediateThrowEvent>
        <bpmn:intermediateThrowEvent id="node_8" name="Intermediate Message Throw Event">
          <bpmn:messageEventDefinition messageRef="node_8_message" />
        </bpmn:intermediateThrowEvent>
      </bpmn:process>
      <bpmn:message id="node_3_message" name="node_3_message" />
      <bpmn:message id="node_4_message" name="node_4_message" />
      <bpmn:message id="node_7_message" name="node_7_message" />
      <bpmn:message id="node_8_message" name="node_8_message" />
    `;

    assertDownloadedXmlContainsExpected(process);

  });

  it('only creates a single new node on copy if you have multiple pools', () => {
    const firstPoolPosition = { x: 210, y: 150 };
    const secondPoolPosition = { x: 210, y: 450 };

    clickAndDropElement(nodeTypes.pool, firstPoolPosition);
    waitToRenderAllShapes();
    clickAndDropElement(nodeTypes.pool, secondPoolPosition);

    const taskInSecondPoolPosition = { x: 300, y: 500 };
    clickAndDropElement(nodeTypes.task, taskInSecondPoolPosition);

    cy.get('[data-test="copy-button"]').click();

    cy.get('.paper-container').click('center', { force: true });
    cy.get('body').type('{ctrl}v');

    waitToRenderAllShapes();

    assertDownloadedXmlContainsSubstringNTimes('<bpmn:task', 2, 'Expect exactly two tasks after copying one');
  });
});
