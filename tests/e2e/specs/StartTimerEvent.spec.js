import {
  dragFromSourceToDest,
  getElementAtPosition,
  modalAnimationTime,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Start Timer Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update properties on Start Timer Event for "week" periodicity', () => {
    const currentDate = Date.UTC(2019, 7, 8, 14);
    cy.clock(currentDate);
    const startTimerEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.startTimerEvent, startTimerEventPosition);

    getElementAtPosition(startTimerEventPosition).click();

    cy.contains('Timing Control').click();
    cy.contains('Timing Control').get('.badge-primary').should('not.exist');
    cy.contains('You must select at least one day.').should('exist');
    cy.get('.border-primary').should('contain', 'T');

    cy.get('[data-test=start-date-picker]').click();
    cy.get('.bootstrap-datetimepicker-widget').contains('14').click();
    cy.get('[data-action="togglePicker"]').click();
    cy.get('[data-action="decrementHours"]').click();
    cy.get('[data-action="incrementMinutes"]').click();
    cy.get('[data-action="close"]').click();
    cy.get('[data-test=start-date-picker]').should('have.value', '08/14/2019 1:01 PM' );

    typeIntoTextInput('[data-test=repeat-input]', 3);
    cy.get('[data-test=day-3]').click();
    cy.contains('You must select at least one day.').should('not.exist');
    cy.get('[data-test=ends-on]').click('left');
    cy.get('[data-test=end-date-picker]').click();
    cy.get('.bootstrap-datetimepicker-widget').contains('22').click();
    cy.get('[data-action="togglePicker"]').click();
    cy.get('[data-action="decrementHours"]').click();
    cy.get('[data-action="incrementMinutes"]').click();
    cy.get('[data-action="close"]').click();
    cy.get('[data-test=end-date-picker]').should('have.value', '08/22/2019 12:02 PM');

    const timerExpression1 = 'R/2019-08-14T13:01:00.000Z/P3W/2019-08-22T13:01:00.000Z';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', timerExpression1);

    cy.get('[data-test=day-2]').click();
    cy.get('[data-test=day-4]').click();

    const timerExpression2 = [
      '2019-08-14T13:01:00.000Z',
      'R/2019-08-20T13:01:00.000Z/P3W/2019-08-22T13:01:00.000Z',
      'R/2019-08-14T13:01:00.000Z/P3W/2019-08-22T13:01:00.000Z',
      'R/2019-08-15T13:01:00.000Z/P3W/2019-08-22T13:01:00.000Z',
    ].join('|');
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', timerExpression2);
  });

  

  it('Updates properties for periodicity other than "week"', function() {
    const year = 2019;
    const month = 7;
    const day = 8;
    const hour = 14;
    const currentDate = Date.UTC(year, month, day, hour);
    const currentDateString = `${year}-0${month + 1}-0${day}T${hour}:00:00.000Z`;

    cy.clock(currentDate);
    const startTimerEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.startTimerEvent, startTimerEventPosition);
    getElementAtPosition(startTimerEventPosition).click();
    cy.contains('Timing Control').click();

    const repeat = 3;
    typeIntoTextInput('[data-test=repeat-input]', repeat);

    cy.get('[data-test=ends-on]').click('left');
    cy.get('[data-test=end-date-picker]').click();
    cy.wait(modalAnimationTime);
    const endDay = 22;
    cy.get('.bootstrap-datetimepicker-widget').contains(endDay).click();
    cy.get('[data-action="close"]').click();

    const periods = [
      { selector: 'day', letter: 'D' },
      { selector: 'month', letter: 'M' },
      { selector: 'year', letter: 'Y' },
    ];

    periods.forEach(({ selector, letter }) => {
      cy.get('[data-test=repeat-on-select]').select(selector);

      const timerExpression = `R/${currentDateString}/P${repeat}${letter}/2019-0${month + 1}-${endDay}T${hour}:00:00.000Z`;
      cy.get('[data-test=downloadXMLBtn]').click();
      cy.window()
        .its('xml')
        .then(xml => xml.trim())
        .should('contain', timerExpression);
    });

    cy.get('[data-test=ends-after]').click('left');
    const endsAfter = 4;
    typeIntoTextInput('[data-test=ends-after-input]', endsAfter);

    periods.forEach(({ selector, letter }) => {
      cy.get('[data-test=repeat-on-select]').select(selector);

      const timerExpression = `R${endsAfter}/${currentDateString}/P${repeat}${letter}`;
      cy.get('[data-test=downloadXMLBtn]').click();
      cy.window()
        .its('xml')
        .then(xml => xml.trim())
        .should('contain', timerExpression);
    });

    const endsNeverExpression = `R/${currentDateString}/P${repeat}Y`;
    cy.get('[data-test=ends-never]').click('left');
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', endsNeverExpression);
  });

  it('Does not include selected weekdays for periods other than "week"', function() {
    const year = 2019;
    const month = 7;
    const day = 8;
    const hour = 14;
    const currentDate = Date.UTC(year, month, day, hour);
    const currentDateString = `${year}-0${month + 1}-0${day}T${hour}:00:00.000Z`;

    cy.clock(currentDate);
    const startTimerEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.startTimerEvent, startTimerEventPosition);
    getElementAtPosition(startTimerEventPosition).click();
    cy.contains('Timing Control').click();
    cy.get('[data-test=day-1]').click();
    cy.get('[data-test=day-2]').click();
    cy.get('[data-test=day-3]').click();
    cy.get('[data-test=repeat-on-select]').select('month');

    const dateExpression = `R/${currentDateString}/P1M`;
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', dateExpression);
  });
});
