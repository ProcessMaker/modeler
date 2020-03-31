import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected, typeIntoTextInput } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Intermediate Signal Throw Event', () => {
  it('Can create intermediate signal throw event', () => {
    const intermediateSignalThrowEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(intermediateSignalThrowEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-signal-throw-event');
    typeIntoTextInput('[name=signalRef]', 'node_3_signal');

    assertDownloadedXmlContainsExpected(`
      <bpmn:intermediateThrowEvent id="node_3" name="Intermediate Signal Throw Event">
        <bpmn:signalEventDefinition signalRef="node_3_signal" />
      </bpmn:intermediateThrowEvent>
    `);
    assertDownloadedXmlContainsExpected(`
      <bpmn:signal id="node_3_signal" name="node_3_signal" />
    `);
  });
});
