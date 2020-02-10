import {
  dragFromSourceToDest,
  removeIndentationAndLinebreaks,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Copy element', () => {
  it('copy start event node', () => {
    const startEventPosition = { x: 150, y: 150 };
    dragFromSourceToDest(nodeTypes.startEvent, startEventPosition);

    cy.get('[data-test=copy-button]').click();

    const twoSartEventsXML = '<bpmn:startEvent id="node_1" name="Start Event" /><bpmn:startEvent id="node_2" name="Start Event" /><bpmn:startEvent id="node_3" name="Start Event" />';
    

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(twoSartEventsXML);
      });
  });
});

