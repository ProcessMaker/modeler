import {
  dragFromSourceToDest, assertDownloadedXMLMatchesExpected, getElementAtPosition,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Message Start Event', () => {
  it('Can create message start event', function() {
    const messageStartEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.messageStartEvent, messageStartEventPosition);
    assertDownloadedXMLMatchesExpected(`
      <bpmn:startEvent id="node_2" name="Message Start Event">
        <bpmn:messageEventDefinition />
      </bpmn:startEvent>
    `);

    const intermediateMessageThrowEvent = { x: 350, y: 350 };
    dragFromSourceToDest(nodeTypes.intermediateMessageThrowEvent, intermediateMessageThrowEvent);
    getElementAtPosition(messageStartEventPosition).click();
    cy.contains('Listen For Message').next('select').select('node_3_message');

    assertDownloadedXMLMatchesExpected(`
      <bpmn:startEvent id="node_2" name="Message Start Event">
        <bpmn:messageEventDefinition messageRef="node_3_message" />
      </bpmn:startEvent>
    `);
  });
});
