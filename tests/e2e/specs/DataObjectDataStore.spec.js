import {
  assertDownloadedXmlContainsExpected,
  connectNodesWithFlow,
  dragFromSourceToDest, getCrownButtonForElement,
  getElementAtPosition, getNumberOfLinks, uploadXml,
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

      connectNodesWithFlow('sequence-flow-button', startEventPosition, dataPosition);
      getNumberOfLinks().should('equal', 0);
    });
  });

  [nodeTypes.dataObject, nodeTypes.dataStore].forEach(nodeType => {
    it(`can add data output association flows for ${nodeType}`, () => {
      dragFromSourceToDest(nodeType, dataPosition);
      connectNodesWithFlow('association-flow-button', startEventPosition, dataPosition);

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

      getNumberOfLinks().should('equal', 1);
      assertDownloadedXmlContainsExpected(`
        <bpmn:task id="node_2" name="Form Task" pm:assignment="requester">
          <bpmn:dataInputAssociation id="node_4">
            <bpmn:targetRef>node_3</bpmn:targetRef>
          </bpmn:dataInputAssociation>
        </bpmn:task>
      `);
    });
  });
});
