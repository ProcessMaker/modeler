import {
  assertDownloadedXmlContainsExpected, assertDownloadedXmlDoesNotContainExpected, assertElementsAreConnected,
  assertDownloadedXmlMatch,
  connectNodesWithFlow,
  clickAndDropElement, getCrownButtonForElement,
  getElementAtPosition, getNumberOfLinks, uploadXml, waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Data Objects and Data Stores', () => {
  const dataPosition = { x: 350, y: 250 };
  const startEventPosition = { x: 210, y: 200 };
  const taskPosition = { x: 500, y: 400 };

  [nodeTypes.dataObject, nodeTypes.dataStore].forEach(nodeType => {
    it(`does not support connecting sequence flows for ${nodeType}`, () => {
      clickAndDropElement(nodeType, dataPosition);
      waitToRenderAllShapes();

      getElementAtPosition(dataPosition)
        .click()
        .then($el => getCrownButtonForElement($el, 'sequence-flow-button'))
        .should('not.exist');
    });
  });

  [nodeTypes.dataObject].forEach(nodeType => {
    it(`can add data output association flows for ${nodeType}`, () => {
      clickAndDropElement(nodeType, dataPosition);
      connectNodesWithFlow('generic-flow-button', startEventPosition, dataPosition);

      getNumberOfLinks().should('equal', 1);
      assertDownloadedXmlContainsExpected(`
        <bpmn:startEvent id="node_1" name="Start Event">
          <bpmn:dataOutputAssociation id="node_3">
            <bpmn:targetRef>node_2</bpmn:targetRef>
          </bpmn:dataOutputAssociation>
        </bpmn:startEvent>
      `);
    });
  });

  it('can parse and load a data output association from a BPMN file', () => {
    uploadXml('withDataOutputAssociation.xml');

    getNumberOfLinks().should('equal', 1);
    assertDownloadedXmlContainsExpected(`
        <bpmn:startEvent id="node_1" name="Start Event">
          <bpmn:dataOutputAssociation id="node_3">
            <bpmn:targetRef>node_2</bpmn:targetRef>
          </bpmn:dataOutputAssociation>
        </bpmn:startEvent>
      `);
  });

  it('can parse and load a data input association from a BPMN file', () => {
    uploadXml('withDataInputAssociation.xml');

    assertElementsAreConnected('node_2', 'node_1');

    assertDownloadedXmlContainsExpected(`
        <bpmn:task id="node_1" name="Form Task" pm:assignment="requester">
          <bpmn:ioSpecification id="node_1_inner_1689079187363">
            <bpmn:dataInput id="data_input_node_2" name="Data Object" />
            <bpmn:inputSet id="node_1_inner_1689079187365">
              <bpmn:dataInputRefs>data_input_node_2</bpmn:dataInputRefs>
            </bpmn:inputSet>
            <bpmn:outputSet id="node_1_inner_1689079187366" />
          </bpmn:ioSpecification>
          <bpmn:dataInputAssociation id="node_3">
            <bpmn:sourceRef>node_2</bpmn:sourceRef>
            <bpmn:targetRef>data_input_node_2</bpmn:targetRef>
          </bpmn:dataInputAssociation>
        </bpmn:task>
        <bpmn:dataObjectReference id="node_2" name="Data Object" />
      `);
  });

  [nodeTypes.dataObject, nodeTypes.dataStore].forEach(nodeType => {
    it(`does not support connecting data input association to start event for ${nodeType}`, () => {
      clickAndDropElement(nodeType, dataPosition);
      waitToRenderAllShapes();
      connectNodesWithFlow('association-flow-button', dataPosition, startEventPosition);
      getNumberOfLinks().should('equal', 0);
    });
  });

  [nodeTypes.dataObject, nodeTypes.dataStore].forEach(nodeType => {
    it(`can add data input association flows for ${nodeType}`, () => {
      clickAndDropElement(nodeTypes.task, taskPosition);
      waitToRenderAllShapes();
      clickAndDropElement(nodeType, dataPosition);
      waitToRenderAllShapes();
      connectNodesWithFlow('association-flow-button', dataPosition, taskPosition);

      const name = nodeType === 'processmaker-modeler-data-object' ? 'Data Object' : 'Data Store';
      getNumberOfLinks().should('equal', 1);
      assertDownloadedXmlMatch(`
        <bpmn:task id="node_*" name="Form Task" pm:assignment="requester" pm:elementDestination="{&#34;type&#34;:&#34;taskSource&#34;,&#34;value&#34;:null}">
          <bpmn:ioSpecification id="*">
            <bpmn:dataInput id="data_input_node_*" name="${name}" isCollection="false" />
            <bpmn:inputSet id="*">
              <bpmn:dataInputRefs>data_input_node_*</bpmn:dataInputRefs>
            </bpmn:inputSet>
            <bpmn:outputSet id="*" />
          </bpmn:ioSpecification>
          <bpmn:dataInputAssociation id="node_*">
            <bpmn:sourceRef>node_*</bpmn:sourceRef>
            <bpmn:targetRef>data_input_node_*</bpmn:targetRef>
          </bpmn:dataInputAssociation>
        </bpmn:task>
      `);
    });
  });

  it('removed the data input association on the task when the data object is deleted', () => {
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    clickAndDropElement(nodeTypes.dataObject, dataPosition);
    waitToRenderAllShapes();
    connectNodesWithFlow('association-flow-button', dataPosition, taskPosition);
    waitToRenderAllShapes();

    assertDownloadedXmlMatch(`
      <bpmn:dataInputAssociation id="node_*">
        <bpmn:sourceRef>node_*</bpmn:sourceRef>
        <bpmn:targetRef>data_input_node_*</bpmn:targetRef>
      </bpmn:dataInputAssociation>
    `);

    assertDownloadedXmlMatch(`
      <bpmn:dataObjectReference id="node_*" name="Data Object" />
    `);

    getElementAtPosition(dataPosition)
      .click()
      .then($el => {
        return getCrownButtonForElement($el, 'delete-button');
      })
      .click();
    waitToRenderAllShapes();

    getNumberOfLinks().should('equal', 0);

    assertDownloadedXmlDoesNotContainExpected(`
      <bpmn:dataInputAssociation id="node_9">
        <bpmn:sourceRef>node_8</bpmn:sourceRef>
        <bpmn:targetRef>data_input_node_8</bpmn:targetRef>
      </bpmn:dataInputAssociation>
    `);

    assertDownloadedXmlDoesNotContainExpected(`
      <bpmn:dataObjectReference id="node_8" name="Data Object" />
    `);
  });

  it('removes the data output association on the task when the data object is deleted', () => {
    clickAndDropElement(nodeTypes.task, taskPosition);
    waitToRenderAllShapes();
    clickAndDropElement(nodeTypes.dataObject, dataPosition);
    waitToRenderAllShapes();
    connectNodesWithFlow('generic-flow-button', taskPosition, dataPosition);

    assertDownloadedXmlMatch(`
      <bpmn:dataOutputAssociation id="node_*">
        <bpmn:targetRef>node_*</bpmn:targetRef>
      </bpmn:dataOutputAssociation>
    `);

    assertDownloadedXmlMatch(`
      <bpmn:dataObjectReference id="node_*" name="Data Object" />
    `);

    getElementAtPosition(dataPosition)
      .click()
      .then($el => {
        return getCrownButtonForElement($el, 'delete-button');
      })
      .click();

    getNumberOfLinks().should('equal', 0);

    assertDownloadedXmlDoesNotContainExpected(`
      <bpmn:dataOutputAssociation id="node_16">
        <bpmn:targetRef>node_8</bpmn:targetRef>
      </bpmn:dataOutputAssociation>
    `);

    assertDownloadedXmlDoesNotContainExpected(`
      <bpmn:dataObjectReference id="node_8" name="Data Object" />
    `);
  });
});
