import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Signal Start Event', () => {
  it('Can create signal start event', () => {
    const signalStartEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(signalStartEventPosition, nodeTypes.startEvent, 'switch-to-signal-start-event');

    assertDownloadedXmlContainsExpected(`
      <bpmn:startEvent id="node_3" name="Signal Start Event">
        <bpmn:signalEventDefinition />
      </bpmn:startEvent>
    `);
  });

  it('Configure the signal request variable', () => {
    const signalStartEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(signalStartEventPosition, nodeTypes.startEvent, 'switch-to-signal-start-event');

    // Config the signal request variable in the inspector
    cy.get('input[data-cy="signal-request-variable"]').type('signalRequestVariable');

    assertDownloadedXmlContainsExpected(`
      <bpmn:startEvent id="node_3" name="Signal Start Event" pm:config="signalRequestVariable">
        <bpmn:signalEventDefinition />
      </bpmn:startEvent>
    `);
  });
});
