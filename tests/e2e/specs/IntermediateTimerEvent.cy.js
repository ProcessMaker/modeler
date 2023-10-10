import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  clickAndDropElement,
  getElementAtPosition,
  toggleInspector,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Intermediate Timer Event', () => {
  beforeEach(() => {
    toggleInspector();
  });

  /**
   * TODO: this test was skipped because the Timing Control is not available
   */
  it('Update delay field on Intermediate Timer Event', () => {
    const intermediateCatchEventPosition = { x: 350, y: 250 };
    clickAndDropElement(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);
    waitToRenderAllShapes();

    getElementAtPosition(intermediateCatchEventPosition).click();

    const testString = 'testing';
    const testDurationDelayValue = 4;
    typeIntoTextInput('[name=name]', testString);
    cy.contains('Timing Control').click();
    typeIntoTextInput('.repeat', testDurationDelayValue);

    const validIntermediateCatchEventXML = `
    <bpmn:intermediateCatchEvent id="node_2" name="testing">
      <bpmn:timerEventDefinition>
        <bpmn:timeDuration>PT4H</bpmn:timeDuration>
      </bpmn:timerEventDefinition>
    </bpmn:intermediateCatchEvent>
    `;
    waitToRenderAllShapes();
    assertDownloadedXmlContainsExpected(validIntermediateCatchEventXML);
  });

  /**
   * TODO: this test was skipped because the Timing Control is not available
   */
  it('Update date/time field on Intermediate Timer Event', () => {
    const intermediateCatchEventPosition = { x: 350, y: 250 };
    const nameInput = '[name=name]';
    const testString = 'testing';
    const startDateTime = '02/27/2019 12:30 AM';
    const startDateTimeInUTC = '2019-02-27T00:30:00.000Z';
    const expectedIntermediateCatchEventWithTimer = `
    <bpmn:intermediateCatchEvent id="node_2" name="testing">
    <bpmn:timerEventDefinition>
      <bpmn:timeDate>${startDateTimeInUTC}</bpmn:timeDate>
    </bpmn:timerEventDefinition>
  </bpmn:intermediateCatchEvent>
  `;

    clickAndDropElement(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);
    waitToRenderAllShapes();
    getElementAtPosition(intermediateCatchEventPosition).click();

    typeIntoTextInput(nameInput, testString);
    cy.contains('Timing Control').click();
    cy.get('[data-test=intermediateTypeSelect]').select('Date/Time');
    typeIntoTextInput('[data-test=date-picker]', startDateTime);
    cy.get('[data-test=date-picker]').type('{enter}');

    cy.get('[data-test=date-picker]>input').should('have.value', startDateTime);
    assertDownloadedXmlContainsExpected(expectedIntermediateCatchEventWithTimer);
  });

  /**
   * TODO: this test was skipped because the Timing Control is not available
   */
  it('Sets default values when switching between types', () => {
    cy.clock();

    const intermediateCatchEventPosition = { x: 350, y: 250 };
    clickAndDropElement(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);

    cy.get('[data-type="processmaker.components.nodes.intermediateEvent.Shape"]').first().click({ force:true });
    cy.contains('Timing Control').click();
    cy.get('[data-test=intermediateTypeSelect]').select('Date/Time');

    const defaultTimeDate = '<bpmn:timeDate>1970-01-01T00:00:00.000Z</bpmn:timeDate>';

    assertDownloadedXmlContainsExpected(defaultTimeDate);

    cy.get('[data-test=intermediateTypeSelect]').select('Duration');

    cy.get('[data-test=downloadXMLBtn]').click();

    const defaultTimeDuration = '<bpmn:timeDuration>PT1H</bpmn:timeDuration>';
    assertDownloadedXmlContainsExpected(defaultTimeDuration);
  });

  /**
   * TODO: this test was skipped because the Timing Control is not available
   */
  it('should toggle between showing the weekday select when week is selected, and hiding it when it is not', () => {
    const intermediateTimerEventPosition = { x: 350, y: 250 };
    addNodeTypeToPaper(intermediateTimerEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-timer-catch-event');
    cy.contains('Timing Control').click();
    cy.get('[data-test=intermediateTypeSelect]').select('Cycle');

    cy.get('[data-test="periods"]').select('week');
    cy.contains('Repeat on').should('be.visible');

    cy.get('[data-test="periods"]').select('day');
    cy.contains('Repeat on').should('not.exist');

    cy.get('[data-test="periods"]').select('week');
    cy.contains('Repeat on').should('be.visible');
  });
});
