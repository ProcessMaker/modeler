import {
  dragFromSourceToDest,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Intermediate Catch Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update delay field on Intermediate Catch Event', () => {
    const intermediateCatchEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(
      nodeTypes.intermediateCatchEvent,
      '.paper-container',
      intermediateCatchEventPosition
    );

    cy.get('.joint-viewport').find('#j_5').click({force: true});

    const nameInput = '[name=\'name\']';
    const testString = 'testing';
    typeIntoTextInput(nameInput, testString);

    const delayRepeatInput = '.repeat';
    typeIntoTextInput(delayRepeatInput, 4);

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
      .then(xml => { xml.trim(); }).should('have', validIntermediateCatchEventXML.trim());
  });

  it('Update date/time field on Intermediate Catch Event', () => {
    const intermediateCatchEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(
      nodeTypes.intermediateCatchEvent,
      '.paper-container',
      intermediateCatchEventPosition
    );

    cy.get('.joint-viewport').find('#j_5').click({force: true});

    const nameInput = '[name=\'name\']';
    const testString = 'testing';
    typeIntoTextInput(nameInput, testString);

    cy.get('[data-test=intermediateTypeSelect]').select('Date/Time');
    const startDateInput = '.start-date';
    const startDateValue = '2019-02-27';
    typeIntoTextInput(startDateInput, startDateValue);

    const startTimeValue = '00:30';
    cy.get('[data-test=startTime]').select(startTimeValue);

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
      .then(xml => { xml.trim(); }).should('have', validIntermediateCatchEventXML.trim());
  });
});
