import {
  dragFromSourceToDest,
  getElementAtPosition,
  removeIndentationAndLinebreaks,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

const xmlSnippet = '<bpmn:endEvent id="node_2" name="Message End Event"><bpmn:messageEventDefinition /></bpmn:endEvent>';
const messageEndEventPosition = { x: 300, y: 200 };

describe('Message End Event', () => {
  it('can render a message end event', function() {
    dragFromSourceToDest(nodeTypes.messageEndEvent, messageEndEventPosition);

    getElementAtPosition(messageEndEventPosition).click();

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window().its('xml').then(removeIndentationAndLinebreaks).then(xml => {
      expect(xml).to.contain(xmlSnippet);
    });
  });
});
