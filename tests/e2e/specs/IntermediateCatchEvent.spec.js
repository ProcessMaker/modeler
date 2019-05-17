import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Intermediate Catch Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update delay field on Intermediate Catch Event', () => {
    const intermediateCatchEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);

    getElementAtPosition(intermediateCatchEventPosition).click();

    const testString = 'testing';
    const testDurationDelayValue = 4;
    typeIntoTextInput('[name=name]', testString);
    cy.contains('Timing Control').click();
    typeIntoTextInput('.repeat', testDurationDelayValue);

    const validIntermediateCatchEventXML = `
    <bpmn:intermediateCatchEvent id="node_4" name="testing">
      <bpmn:timerEventDefinition>
        <bpmn:timeDuration>P1D</bpmn:timeDuration>
      </bpmn:timerEventDefinition>
    </bpmn:intermediateCatchEvent>
    `;
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('have', validIntermediateCatchEventXML.trim());
  });

  it.skip('Update date/time field on Intermediate Catch Event', () => {
    const intermediateCatchEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);

    getElementAtPosition(intermediateCatchEventPosition).click();

    const nameInput = '[name=name]';
    const testString = 'testing';
    typeIntoTextInput(nameInput, testString);

    cy.contains('Timing Control').click();
    cy.get('[data-test=intermediateTypeSelect]').select('Date/Time');
    const startDateValue = '2019-02-27';
    typeIntoTextInput('.start-date', startDateValue);

    const startTimeValue = '00:30';
    cy.get('[data-test=startTime]').select(startTimeValue, { force: true });

    const validIntermediateCatchEventXML = `
    <bpmn:intermediateCatchEvent id="node_4" name="testing">
    <bpmn:timerEventDefinition>
      <bpmn:timeDate>2019-02-27T00:30-05:00</bpmn:timeDate>
    </bpmn:timerEventDefinition>
  </bpmn:intermediateCatchEvent>
  `;
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('have', validIntermediateCatchEventXML.trim());
  });
});
