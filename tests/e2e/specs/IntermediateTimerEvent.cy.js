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

  it('should support FEEL expressions for timer configurations', () => {
    const intermediateTimerEventPosition = { x: 350, y: 250 };
    addNodeTypeToPaper(intermediateTimerEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-timer-catch-event');
    cy.contains('Timing Control').click();
    
    // Test FEEL expression with Date/Time
    cy.get('[data-test=intermediateTypeSelect]').select('Date/Time');
    
    // // Find the FEEL expression toggle by looking for a checkbox or switch in the timer control section
    cy.get('[data-test=dynamicExpressionToggle]').click({force: true});
    
    // // Type the FEEL expression in the textarea that appears
    cy.get('[data-test=feelExpressionInput]').clear().type('date and time(ProcessVariable.targetDate)');
    
    const dateTimeFeelXML = '<bpmn:timeDate xsi:type="bpmn:tFormalExpression">date and time(ProcessVariable.targetDate)</bpmn:timeDate>';
    assertDownloadedXmlContainsExpected(dateTimeFeelXML);
    
    // Test FEEL expression with Cycle
    cy.get('[data-test=intermediateTypeSelect]').select('Cycle');
    
    // The FEEL expression toggle should not exist for the Cycle selection
    cy.get('[data-test=dynamicExpressionToggle]').should('not.exist');

    // Test FEEL expression with Duration
    cy.get('[data-test=intermediateTypeSelect]').select('Duration');

    // The FEEL expression toggle should not exist for the Duration selection
    cy.get('[data-test=dynamicExpressionToggle]').should('not.exist');
  });

  it('should not persist FEEL expressions when switching between timer types', () => {
    const intermediateTimerEventPosition = { x: 350, y: 250 };
    addNodeTypeToPaper(intermediateTimerEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-timer-catch-event');
    cy.contains('Timing Control').click();
    
    // Set FEEL expression for Date/Time
    cy.get('[data-test=intermediateTypeSelect]').select('Date/Time');
    cy.get('[data-test=dynamicExpressionToggle]').click({force: true});
    cy.get('[data-test=feelExpressionInput]').clear().type('date and time(ProcessVariable.targetDate)');
    
    // Switch to Duration and back to Date/Time - FEEL expression should persist
    cy.get('[data-test=intermediateTypeSelect]').select('Duration');
    cy.get('[data-test=intermediateTypeSelect]').select('Date/Time');
    
    // Verify the FEEL expression is still there
    cy.get('[data-test=dynamicExpressionToggle]').click({force: true});
    cy.get('[data-test=dynamicExpressionToggle]').should('be.checked');
    cy.get('[data-test=feelExpressionInput]').should('not.have.value', 'date and time(ProcessVariable.targetDate)');
  });

  it('should handle complex FEEL expressions in timer configurations', () => {
    const intermediateTimerEventPosition = { x: 350, y: 250 };
    addNodeTypeToPaper(intermediateTimerEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-timer-catch-event');
    cy.contains('Timing Control').click();
    
    // Test complex FEEL expression with Date/Time
    cy.get('[data-test=intermediateTypeSelect]').select('Date/Time');
    cy.get('[data-test=dynamicExpressionToggle]').click({force: true});
    
    // Type a more complex FEEL expression
    const complexExpression = 'date and time(string(ProcessVariable.year) + "-" + string(ProcessVariable.month) + "-" + string(ProcessVariable.day) + "T" + string(ProcessVariable.hour) + ":" + string(ProcessVariable.minute) + ":00Z")';
    cy.get('[data-test=feelExpressionInput]').clear().type(complexExpression);
    
    const complexFeelXML = `<bpmn:timeDate xsi:type="bpmn:tFormalExpression">${complexExpression}</bpmn:timeDate>`;
    assertDownloadedXmlContainsExpected(complexFeelXML);
  });

  it('should display help information about FEEL expressions', () => {
    const intermediateTimerEventPosition = { x: 350, y: 250 };
    addNodeTypeToPaper(intermediateTimerEventPosition, nodeTypes.intermediateCatchEvent, 'switch-to-intermediate-timer-catch-event');
    cy.contains('Timing Control').click();
    
    // Select Date/Time type and enable FEEL expressions
    cy.get('[data-test=intermediateTypeSelect]').select('Date/Time');
    cy.get('[data-test=dynamicExpressionToggle]').click({force: true});
    
    // Check for help icon within the documentation link
    cy.get('[data-test=feelDocLink]').should('exist');
    cy.get('[data-test=feelHelpIcon]').should('exist');
    
    // Verify the documentation link exists with the correct URL
    cy.get('[data-test=feelDocLink]')
      .should('have.attr', 'href')
      .and('include', 'docs.processmaker.com/docs/feel-expression-syntax');
    
    // Check for text about FEEL expressions
    cy.contains('Enter a FEEL expression').should('be.visible');
    cy.get('[data-test=feelHelpIcon]').should('exist');
  });
});
