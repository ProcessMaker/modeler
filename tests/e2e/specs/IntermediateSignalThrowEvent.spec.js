import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  selectOptionByName,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';
import _ from 'lodash';

describe('Intermediate Signal Throw Event', () => {

  beforeEach(() => {
    cy.window().then((win) => {
      _.set(win, 'ProcessMaker.modeler.signalPermissions', {
        'create-signals':true,'view-signals':true,'edit-signals':true,'delete-signals':true,
      });
    });
  });

  it('Can create intermediate signal throw event', () => {
    const intermediateSignalThrowEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(intermediateSignalThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-signal-throw-event');
    waitToRenderAllShapes();
    selectOptionByName('[data-test="signalRef:select"]', 'global signal 1');

    assertDownloadedXmlContainsExpected(`
      <bpmn:intermediateThrowEvent id="node_3" name="Intermediate Signal Throw Event">
        <bpmn:signalEventDefinition signalRef="global_1" />
      </bpmn:intermediateThrowEvent>
    `);
    assertDownloadedXmlContainsExpected(`
      <bpmn:signal id="global_1" name="global signal 1" />
    `);
  });
});
