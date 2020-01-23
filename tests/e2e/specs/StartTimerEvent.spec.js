import {
  addNodeTypeToPaper,
  dragFromSourceToDest,
  getElementAtPosition,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Start Timer Event', () => {
  it('Update properties on Start Timer Event for "week" periodicity', () => {
    const currentDate = Date.UTC(2019, 7, 8, 14);
    cy.clock(currentDate);
    const startTimerEventPosition = { x: 250, y: 250 };
    addNodeTypeToPaper(startTimerEventPosition, nodeTypes.startEvent, 'switch-to-start-timer-event');
    waitToRenderAllShapes();
    cy.get('[data-test=switch-to-start-timer-event]').click(); //This clears the crown dropdown

    cy.contains('Timing Control').click();
    cy.contains('Timing Control').get('.badge-primary').should('not.exist');
    cy.contains('You must select at least one day.').should('exist');
    cy.get('.border-primary').should('contain', 'T');

    cy.get('[data-test=start-date-picker]').click();
    cy.get('.day').contains('14').click();
    cy.get('[title="Select Time"]').click();
    cy.get('[title="Pick Hour"]').click();
    cy.get('.hour').contains('05').click();
    cy.get('[title="Pick Minute"]').click();
    cy.get('.minute').contains('30').click();
    cy.get('[title="Toggle Period"]').click();
    cy.get('[data-test=start-date-picker]').should('have.value', '08/14/2019 5:30 AM');

    cy.get('[data-test=end-date-picker]').click({ force: true });
    typeIntoTextInput('[data-test=repeat-input]', 3);
    cy.get('[data-test=day-3]').click();
    cy.contains('You must select at least one day.').should('not.exist');
    cy.get('[data-test=ends-on]').click('left', { force: true });
    cy.get('[data-test=end-date-picker]').click();
    cy.get('.day').contains('22').click();

    cy.get('[data-test=end-date-picker]').should('have.value', '08/22/2019 5:30 AM');
    cy.get('.paper-container').click();
    getElementAtPosition(startTimerEventPosition).click();
    cy.contains('Timing Control').click();
    cy.get('[data-test=end-date-picker]').should('have.value', '08/22/2019 5:30 AM');

    const timerExpression1 = 'R/2019-08-14T05:30:00.000Z/P3W/2019-08-22T05:30:00.000Z';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', timerExpression1);

    cy.get('[data-test=day-2]').click();
    cy.get('[data-test=day-4]').click();

    const timerExpression2 = [
      '2019-08-14T05:30:00.000Z',
      'R/2019-08-20T05:30:00.000Z/P3W/2019-08-22T05:30:00.000Z',
      'R/2019-08-14T05:30:00.000Z/P3W/2019-08-22T05:30:00.000Z',
      'R/2019-08-15T05:30:00.000Z/P3W/2019-08-22T05:30:00.000Z',
    ].join('|');
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', timerExpression2);
  });

  it('Updates properties for periodicity other than "week"', () => {
    const year = 2019;
    const month = 7;
    const day = 8;
    const hour = 14;
    const currentDate = Date.UTC(year, month, day, hour);
    const currentDateString = `${year}-0${month + 1}-0${day}T${hour}:00:00.000Z`;

    cy.clock(currentDate);
    const startTimerEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.startEvent, startTimerEventPosition);
    cy.get('[data-test=switch-to-start-timer-event]').click();

    getElementAtPosition(startTimerEventPosition).click();
    cy.contains('Timing Control').click();

    const repeat = 3;
    typeIntoTextInput('[data-test=repeat-input]', repeat);

    const endDay = 22;
    cy.get('[data-test=ends-on]').click('left', { force: true });
    cy.get('[data-test=end-date-picker]')
      .click();
    cy.get('.form-date-picker')
      .contains(endDay)
      .click();

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

    cy.get('[data-test=ends-after]').click('left', { force: true });
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
    cy.get('[data-test=ends-never]').click('left', { force: true });
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', endsNeverExpression);
  });

  it('Does not include selected weekdays for periods other than "week"', () => {
    const year = 2019;
    const month = 7;
    const day = 8;
    const hour = 14;
    const currentDate = Date.UTC(year, month, day, hour);
    const currentDateString = `${year}-0${month + 1}-0${day}T${hour}:00:00.000Z`;

    cy.clock(currentDate);
    const startTimerEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.startEvent, startTimerEventPosition);
    cy.get('[data-test=switch-to-start-timer-event]').click();

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
