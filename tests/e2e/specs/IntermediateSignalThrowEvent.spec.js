import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected, selectOptionByName } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Intermediate Signal Throw Event', () => {
  it('Can create intermediate signal throw event', () => {
    const intermediateSignalThrowEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(intermediateSignalThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-signal-throw-event');
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
