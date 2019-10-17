import {
  dragFromSourceToDest,
  getElementAtPosition,
  removeIndentationAndLinebreaks,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Intermediate Message Throw Event', () => {
  it('can render an intermediate message throw event', function() {
    const intermediateMessageThrowEventPosition = { x: 200, y: 200 };

    dragFromSourceToDest(nodeTypes.intermediateMessageThrowEvent, intermediateMessageThrowEventPosition);

    getElementAtPosition(intermediateMessageThrowEventPosition).click();

    const eventXMLSnippet = '<bpmn:intermediateThrowEvent id="node_2" name="Intermediate Message Throw Event" configuration="null" advanced="null"><bpmn:messageEventDefinition /></bpmn:intermediateThrowEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window().its('xml').then(removeIndentationAndLinebreaks).then(xml => {
      expect(xml).to.contain(eventXMLSnippet);
    });
  });
});
