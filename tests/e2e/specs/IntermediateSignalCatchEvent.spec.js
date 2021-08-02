import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Intermediate Signal Catch Event', () => {
  it('Can create an intermediate signal catch event', () => {
    const intermediateSignalCatchEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(intermediateSignalCatchEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-signal-catch-event');

    assertDownloadedXmlContainsExpected(`
      <bpmn:intermediateCatchEvent id="node_3" name="Intermediate Signal Catch Event">
        <bpmn:signalEventDefinition />
      </bpmn:intermediateCatchEvent>
    `);
  });

  it('Configure the signal request variable', () => {
    const intermediateSignalCatchEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(intermediateSignalCatchEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-signal-catch-event');

    // Config the signal request variable in the inspector
    cy.get('input[data-cy="signal-request-variable"]').type('signalRequestVariable');

    assertDownloadedXmlContainsExpected(`
      <bpmn:intermediateCatchEvent id="node_3" name="Intermediate Signal Catch Event" pm:config="signalRequestVariable">
        <bpmn:signalEventDefinition />
      </bpmn:intermediateCatchEvent>
    `);
  });
});
