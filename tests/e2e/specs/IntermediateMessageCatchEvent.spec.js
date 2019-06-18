import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
  waitToRenderAllShapes,
  uploadXml,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Intermediate Message Catch Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update properties', () => {
    const intermediateMessageCatchEventPosition = { x: 200, y: 200 };

    dragFromSourceToDest(nodeTypes.intermediateMessageCatchEvent, intermediateMessageCatchEventPosition);

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

    const validXML =
    `<bpmn:intermediateCatchEvent id="node_2" name="${name}" pm:allowedUsers="1,10" pm:allowedGroups="20,30" pm:whitelist="${whiteList}">
      <bpmn:messageEventDefinition id="${eventId}" pm:variableName="${variableName}" />
    </bpmn:intermediateCatchEvent>`;

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', validXML.trim());
  });

  it('Message Event Definition Ids are unique on render', () => {
    const intermediateMessageCatchEventPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.intermediateMessageCatchEvent, intermediateMessageCatchEventPosition);

    const intermediateMessageCatchEventSecondPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.intermediateMessageCatchEvent, intermediateMessageCatchEventSecondPosition);

    const validXML =
    `<bpmn:intermediateCatchEvent id="node_2" name="Intermediate Message Catch Event" pm:allowedUsers="" pm:allowedGroups="" pm:whitelist="">
      <bpmn:messageEventDefinition id="message_event_1" pm:variableName="message" />
    </bpmn:intermediateCatchEvent>
    <bpmn:intermediateCatchEvent id="node_3" name="Intermediate Message Catch Event" pm:allowedUsers="" pm:allowedGroups="" pm:whitelist="">
      <bpmn:messageEventDefinition id="message_event_2" pm:variableName="message" />
    </bpmn:intermediateCatchEvent>`;

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', validXML.trim());
  });

  it('Generates sequential, unique messageEvent IDs', () => {
    waitToRenderAllShapes();

    const intermediateMessageCatchEventPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.intermediateMessageCatchEvent, intermediateMessageCatchEventPosition);
    getElementAtPosition(intermediateMessageCatchEventPosition).click();

    cy.get('[name=eventDefinitionId]').should('have.value', 'message_event_1');

    typeIntoTextInput('[name=eventDefinitionId]', 'message_event_2');

    const intermediateMessageCatchEvent2Position = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateMessageCatchEvent, intermediateMessageCatchEvent2Position);
    getElementAtPosition(intermediateMessageCatchEvent2Position).click();

    cy.get('[name=eventDefinitionId]').should('have.value', 'message_event_3');

    const intermediateMessageCatchEvent3Position = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.intermediateMessageCatchEvent, intermediateMessageCatchEvent3Position);
    getElementAtPosition(intermediateMessageCatchEvent3Position).click();

    cy.get('[name=eventDefinitionId]').should('have.value', 'message_event_4');

    uploadXml('messageFlow.xml');

    dragFromSourceToDest(nodeTypes.intermediateMessageCatchEvent, intermediateMessageCatchEventPosition);
    getElementAtPosition(intermediateMessageCatchEventPosition).click();

    cy.get('[name=eventDefinitionId]').should('have.value', 'message_event_5');
  });
});
