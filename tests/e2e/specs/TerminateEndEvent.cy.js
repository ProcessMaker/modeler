import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Terminate End Event', () => {
  it('Can create terminate end event', () => {
    const terminateEndEventPosition = { x: 350, y: 250 };
    addNodeTypeToPaper(terminateEndEventPosition, nodeTypes.endEvent, 'switch-to-terminate-end-event');

    assertDownloadedXmlContainsExpected(`
      <bpmn:endEvent id="node_3" name="Terminate End Event" pm:elementDestination="{&#34;type&#34;:&#34;summaryScreen&#34;,&#34;value&#34;:null}">
        <bpmn:terminateEventDefinition />
      </bpmn:endEvent>
    `);
  });
});
