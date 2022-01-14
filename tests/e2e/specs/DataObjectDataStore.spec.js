import {
  assertDownloadedXmlContainsExpected, assertDownloadedXmlDoesNotContainExpected, assertElementsAreConnected,
  assertDownloadedXmlMatch,
  connectNodesWithFlow,
  dragFromSourceToDest, getCrownButtonForElement,
  getElementAtPosition, getNumberOfLinks, uploadXml, waitToRenderAllShapes,
} from '../support/utils';

import {nodeTypes} from '../support/constants';

describe('Data Objects and Data Stores', () => {
  const dataPosition = {x: 250, y: 250};
  const startEventPosition = {x: 150, y: 150};
  const taskPosition = { x: 400, y: 400 };

  [nodeTypes.dataObject, nodeTypes.dataStore].forEach(nodeType => {
    it(`does not support connecting sequence flows for ${nodeType}`, () => {
      dragFromSourceToDest(nodeType, dataPosition);

      getElementAtPosition(dataPosition)
        .click()
        .then($el => getCrownButtonForElement($el, 'sequence-flow-button'))
        .should('not.exist');
    });
  });

  [nodeTypes.dataObject, nodeTypes.dataStore].forEach(nodeType => {
    it(`can add data output association flows for ${nodeType}`, () => {
      dragFromSourceToDest(nodeType, dataPosition);
      connectNodesWithFlow('generic-flow-button', startEventPosition, dataPosition);

      getNumberOfLinks().should('equal', 1);
      assertDownloadedXmlContainsExpected(`
        <bpmn:startEvent id="node_1" name="Start Event">
          <bpmn:dataOutputAssociation id="node_4">
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
            <bpmn:dataInputAssociation id="node_3">
                <bpmn:sourceRef>node_2</bpmn:sourceRef>
            </bpmn:dataInputAssociation>
        </bpmn:task>
        <bpmn:dataObjectReference id="node_2" name="Data Object" />
      `);
  });

  [nodeTypes.dataObject, nodeTypes.dataStore].forEach(nodeType => {
    it(`does not support connecting data input association to start event for ${nodeType}`, () => {
      dragFromSourceToDest(nodeType, dataPosition);
      connectNodesWithFlow('association-flow-button', dataPosition, startEventPosition);
      getNumberOfLinks().should('equal', 0);
    });
  });

  [nodeTypes.dataObject, nodeTypes.dataStore].forEach(nodeType => {
    it(`can add data input association flows for ${nodeType}`, () => {
      dragFromSourceToDest(nodeTypes.task, taskPosition);
      dragFromSourceToDest(nodeType, dataPosition);
      connectNodesWithFlow('association-flow-button', dataPosition, taskPosition);

      const name = nodeType === 'processmaker-modeler-data-object' ? 'Data Object' : 'Data Store';
      getNumberOfLinks().should('equal', 1);
      assertDownloadedXmlMatch(`
        <bpmn:task id="node_2" name="Form Task" pm:assignment="requester">
          <bpmn:ioSpecification id="*">
            <bpmn:dataInput id="data_input_node_3" name="${name}" isCollection="false" />
            <bpmn:inputSet id="*">
              <bpmn:dataInputRefs>data_input_node_3</bpmn:dataInputRefs>
            </bpmn:inputSet>
            <bpmn:outputSet id="*" />
          </bpmn:ioSpecification>
          <bpmn:dataInputAssociation id="node_4">
            <bpmn:sourceRef>node_3</bpmn:sourceRef>
            <bpmn:targetRef>data_input_node_3</bpmn:targetRef>
          </bpmn:dataInputAssociation>
        </bpmn:task>
      `);
    });
  });

  it('removed the data input association on the task when the data object is deleted', () => {
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    dragFromSourceToDest(nodeTypes.dataObject, dataPosition);
    connectNodesWithFlow('association-flow-button', dataPosition, taskPosition);
    waitToRenderAllShapes();

    assertDownloadedXmlContainsExpected(`
      <bpmn:dataInputAssociation id="node_4">
        <bpmn:sourceRef>node_3</bpmn:sourceRef>
        <bpmn:targetRef>data_input_node_3</bpmn:targetRef>
      </bpmn:dataInputAssociation>
    `);

    assertDownloadedXmlContainsExpected(`
      <bpmn:dataObjectReference id="node_3" name="Data Object" />
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
      <bpmn:dataInputAssociation id="node_4">
        <bpmn:sourceRef>node_3</bpmn:sourceRef>
        <bpmn:targetRef>data_input_node_3</bpmn:targetRef>
      </bpmn:dataInputAssociation>
    `);

    assertDownloadedXmlDoesNotContainExpected(`
      <bpmn:dataObjectReference id="node_3" name="Data Object" />
    `);
  });

  it('removes the data output association on the task when the data object is deleted', () => {
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    dragFromSourceToDest(nodeTypes.dataObject, dataPosition);
    connectNodesWithFlow('generic-flow-button', taskPosition, dataPosition);

    assertDownloadedXmlContainsExpected(`
      <bpmn:dataOutputAssociation id="node_5">
        <bpmn:targetRef>node_3</bpmn:targetRef>
      </bpmn:dataOutputAssociation>
    `);

    assertDownloadedXmlContainsExpected(`
      <bpmn:dataObjectReference id="node_3" name="Data Object" />
    `);

    getElementAtPosition(dataPosition)
      .click()
      .then($el => {
        return getCrownButtonForElement($el, 'delete-button');
      })
      .click();

    getNumberOfLinks().should('equal', 0);

    assertDownloadedXmlDoesNotContainExpected(`
      <bpmn:dataOutputAssociation id="node_5">
        <bpmn:targetRef>node_3</bpmn:targetRef>
      </bpmn:dataOutputAssociation>
    `);

    assertDownloadedXmlDoesNotContainExpected(`
      <bpmn:dataObjectReference id="node_3" name="Data Object" />
    `);
  });
});
