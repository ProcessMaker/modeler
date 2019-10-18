import {
  dragFromSourceToDest,
  getElementAtPosition,
  removeIndentationAndLinebreaks,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Intermediate Message Throw Event', () => {
  it('can render an intermediate message throw event', function() {
    const intermediateMessageThrowEventPosition = { x: 200, y: 200 };

    dragFromSourceToDest(nodeTypes.intermediateMessageThrowEvent, intermediateMessageThrowEventPosition);

    getElementAtPosition(intermediateMessageThrowEventPosition).click();

    const eventXMLSnippet = '<bpmn:intermediateThrowEvent id="node_2" name="Intermediate Message Throw Event"><bpmn:messageEventDefinition messageRef="node_2_message" /></bpmn:intermediateThrowEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window().its('xml').then(removeIndentationAndLinebreaks).then(xml => {
      expect(xml).to.contain(eventXMLSnippet);
    });
  });
  it('can create a message when intermediate message throw event is dragged on', function() {
    const intermediateMessageThrowEventPosition = { x: 200, y: 200 };

    dragFromSourceToDest(nodeTypes.intermediateMessageThrowEvent, intermediateMessageThrowEventPosition);

    getElementAtPosition(intermediateMessageThrowEventPosition).click();

    const name = 'New message name';
    typeIntoTextInput('[name=messageName]', name);
    const eventXMLSnippet = '<bpmn:intermediateThrowEvent id="node_2" name="Intermediate Message Throw Event"><bpmn:messageEventDefinition messageRef="node_2_message" /></bpmn:intermediateThrowEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window().its('xml').then(removeIndentationAndLinebreaks).then(xml => {
      expect(xml).to.contain(eventXMLSnippet);
    });

  });

  it('can remove the message when intermediate message throw event is deleted');

});
