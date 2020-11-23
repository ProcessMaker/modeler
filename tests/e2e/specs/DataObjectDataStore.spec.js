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
});
