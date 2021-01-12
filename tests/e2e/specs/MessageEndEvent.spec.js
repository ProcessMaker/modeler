import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  assertDownloadedXmlContainsSubstringNTimes,
  getElementAtPosition,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

const messageEndEventPosition = { x: 300, y: 200 };

describe('Message End Event', () => {
  it('can render a message end event', () => {
    addNodeTypeToPaper(messageEndEventPosition, nodeTypes.endEvent, 'switch-to-message-end-event');
    waitToRenderAllShapes();

    getElementAtPosition(messageEndEventPosition).click();

    assertDownloadedXmlContainsExpected(`
      <bpmn:endEvent id="node_3" name="Message End Event">
        <bpmn:messageEventDefinition messageRef="node_3_message" />
      </bpmn:endEvent>
    `);
  });

  it('should not create duplicate messages on undo/redo', () => {
    addNodeTypeToPaper(messageEndEventPosition, nodeTypes.endEvent, 'switch-to-message-end-event');

    cy.get('[data-test=undo]').click();
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click();
    waitToRenderAllShapes();

    assertDownloadedXmlContainsSubstringNTimes('<bpmn:message id=".*?" name=".*?" />', 1, 'There should only be one message element found');
  });
});
