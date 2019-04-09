import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Intermediate Message Catch Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update properties', () => {
    const testString = 'testing';
    const intermediateMessageCatchEventPosition = { x: 200, y: 200 };

    dragFromSourceToDest(nodeTypes.intermediateMessageCatchEvent, intermediateMessageCatchEventPosition);

    waitToRenderAllShapes();
    getElementAtPosition(intermediateMessageCatchEventPosition).click();

    typeIntoTextInput('[name=name]', testString);
    typeIntoTextInput('[name=eventDefinitionId]', testString);
    typeIntoTextInput('[name=dataName]', testString);
    cy.get('[name=allowedUsers]').select('1,10');
    cy.get('[name=allowedGroups]').select('20,30');
    typeIntoTextInput('[name=whitelist]', testString);

    const validXML = `<bpmn:intermediateCatchEvent id="node_2" name="testing" pm:allowedUsers="1,10" pm:allowedGroups="1,10" pm:whitelist="testing">
      <bpmn:messageEventDefinition id="testing" pm:dataName="testing" />
    </bpmn:intermediateCatchEvent>`;

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('to.contain', validXML.trim());
  });
});
