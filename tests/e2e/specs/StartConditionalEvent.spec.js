import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Conditional Start Event', () => {
  it('Can create conditional start event', () => {
    const signalStartEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(signalStartEventPosition, nodeTypes.startEvent, 'switch-to-conditional-start-event');

    assertDownloadedXmlContainsExpected(`
      <bpmn:startEvent id="node_3" name="Conditional Start Event">
        <bpmn:conditionalEventDefinition />
      </bpmn:startEvent>
    `);
  });
});
