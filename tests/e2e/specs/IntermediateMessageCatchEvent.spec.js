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
    const intermediateMessageCatchEventPosition = { x: 200, y: 200 };

    dragFromSourceToDest(nodeTypes.intermediateMessageCatchEvent, intermediateMessageCatchEventPosition);

    waitToRenderAllShapes();
    getElementAtPosition(intermediateMessageCatchEventPosition).click();

    const name = 'Test name';
    typeIntoTextInput('[name=name]', name);

    const eventId = '1234';
    typeIntoTextInput('[name=eventDefinitionId]', eventId);

    const variableName = 'test variablename';
    typeIntoTextInput('[name=variableName]', variableName);

    cy.get('[name=allowedUsers]').select('1,10');
    cy.get('[name=allowedGroups]').select('20,30');

    const whiteList = 'example.com';
    typeIntoTextInput('[name=whitelist]', whiteList);

    const validXML = `<bpmn:intermediateCatchEvent id="node_2" name="${name}" pm:allowedUsers="1,10" pm:allowedGroups="20,30" pm:whitelist="${whiteList}">
      <bpmn:messageEventDefinition id="${eventId}" pm:variableName="${variableName}" />
    </bpmn:intermediateCatchEvent>`;

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', validXML.trim());
  });
});
