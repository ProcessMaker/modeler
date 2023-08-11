import { addNodeTypeToPaper, assertDownloadedXmlContainsExpected, toggleInspector } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Conditional Start Event', { scrollBehavior: false }, () => {
  it('Can create conditional start event', () => {
    const signalStartEventPosition = { x: 350, y: 250 };
    addNodeTypeToPaper(signalStartEventPosition, nodeTypes.startEvent, 'switch-to-conditional-start-event');

    toggleInspector();
    const condition = '[name=condition]';
    cy.get(condition).clear().type('form_input_1=="one"');

    assertDownloadedXmlContainsExpected(`
      <bpmn:startEvent id="node_3" name="Conditional Start Event">
        <bpmn:conditionalEventDefinition><bpmn:condition xsi:type="bpmn:tFormalExpression">form_input_1=="one"</bpmn:condition></bpmn:conditionalEventDefinition>
      </bpmn:startEvent>
    `);
  });
});
