import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Signal End Event', () => {
  it('Can create signal end event', () => {
    const signalEndEventPosition = { x: 350, y: 250 };
    addNodeTypeToPaper(signalEndEventPosition, nodeTypes.endEvent, 'switch-to-signal-end-event');

    assertDownloadedXmlContainsExpected(`
      <bpmn:endEvent id="node_3" name="Signal End Event" pm:elementDestination="{&#34;type&#34;:&#34;summaryScreen&#34;,&#34;value&#34;:null}">
        <bpmn:signalEventDefinition />
      </bpmn:endEvent>
    `);
  });
});
