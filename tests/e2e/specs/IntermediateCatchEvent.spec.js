import {
  dragFromSourceToDest,
  getElementAtPosition,
  removeIndentationAndLinebreaks,
  typeIntoTextInput,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Intermediate Catch Event', () => {
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

  it('Update date/time field on Intermediate Catch Event', () => {
    const intermediateCatchEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);

    getElementAtPosition(intermediateCatchEventPosition).click();

    const nameInput = '[name=name]';
    const testString = 'testing';
    typeIntoTextInput(nameInput, testString);
    cy.contains('Timing Control').click();
    cy.get('[data-test=intermediateTypeSelect]').select('Date/Time');
    const startDateTime = '02/27/2019 12:30 AM';
    typeIntoTextInput('[data-test=date-picker]', startDateTime);
    cy.get('[data-test=date-picker]').should('have.value', startDateTime);

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

  it('Sets default values when switching between types', () => {
    cy.clock();

    const intermediateCatchEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);

    getElementAtPosition(intermediateCatchEventPosition).click();
    cy.contains('Timing Control').click();
    cy.get('[data-test=intermediateTypeSelect]').select('Date/Time');

    const defaultTimeDate = '<bpmn:timeDate>1970-01-01T00:00:00.000Z</bpmn:timeDate>';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .should(xml => {
        expect(xml).to.contain(defaultTimeDate);
      });

    cy.get('[data-test=intermediateTypeSelect]').select('Duration');

    cy.get('[data-test=downloadXMLBtn]').click();

    const defaultTimeDuration = '<bpmn:timeDuration>PT1H</bpmn:timeDuration>';

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .should(xml => {
        expect(xml).to.contain(defaultTimeDuration);
      });
  });
});
