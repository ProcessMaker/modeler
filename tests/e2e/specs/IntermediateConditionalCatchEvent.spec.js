import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Intermediate Conditional Catch Event', () => {
  it('Can create an intermediate conditional catch event', () => {
    const intermediateConditionalCatchEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(intermediateConditionalCatchEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-conditional-catch-event');
    const condition = '[name=condition]';
    cy.get(condition).clear().type('form_input_1=="one"');

    assertDownloadedXmlContainsExpected(`
      <bpmn:intermediateCatchEvent id="node_3" name="Intermediate Conditional Catch Event">
        <bpmn:conditionalEventDefinition><bpmn:condition xsi:type="bpmn:tFormalExpression">form_input_1=="one"</bpmn:condition></bpmn:conditionalEventDefinition>
      </bpmn:intermediateCatchEvent>
    `);
  });
});
