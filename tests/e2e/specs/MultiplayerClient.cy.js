import {
  assertDownloadedXmlContainsExpected,
} from '../support/utils';
describe('Multiplayer client', () => {
  it('create a task', () => {
    cy.window().then((win) => {
      const data = [{
        x: 270,
        y: 190,
        height: 76,
        width: 116,
        type: 'processmaker-modeler-task',
        id: 'node_2',
        oldNodeId: null,
        isAddingLaneAbove: true,
        name: 'Form Task',
        loopCharacteristics: null,
        gatewayDirection: null,
      }];
      win.ProcessMaker.$modeler.multiplayer.createRemoteShape(data);
      assertDownloadedXmlContainsExpected(`
        <bpmn:task id="node_2" name="Form Task" pm:assignment="requester" />
      `);
    });
  });
  it('create a manual task', () => {
    cy.window().then((win) => {
      const data = [{
        x: 270,
        y: 190,
        height: 76,
        width: 116,
        type: 'processmaker-modeler-manual-task',
        id: 'node_2',
        oldNodeId: null,
        isAddingLaneAbove: true,
        name: 'Form Task',
        loopCharacteristics: null,
        gatewayDirection: null,
      }];
      win.ProcessMaker.$modeler.multiplayer.createRemoteShape(data);
      assertDownloadedXmlContainsExpected(`
        <bpmn:manualTask id="node_2" name="Manual Task" pm:assignment="requester" />
      `);
    });
  });
});
