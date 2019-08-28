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

  it('Update properties on Start Timer Event', () => {
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
    cy.wait(modalAnimationTime);
    cy.get('.vdatetime-popup').contains('14').click();
    cy.get('.vdatetime-time-picker__list--hours').contains('05').click({ force: true });
    cy.get('.vdatetime-time-picker__list--minutes').contains('30').click();
    cy.get('.vdatetime-popup').contains('Save').click();
    cy.get('[data-test=start-date-picker]').should('have.value', '8/14/2019, 5:30 AM');

    typeIntoTextInput('[data-test=repeat-input]', 3);
    cy.get('[data-test=day-3]').click();
    cy.contains('You must select at least one day.').should('not.exist');
    cy.get('[data-test=ends-on]').click('left');
    cy.get('[data-test=end-date-picker]').click();
    cy.wait(modalAnimationTime);
    cy.get('.vdatetime-popup').contains('22').click();
    cy.get('[data-test=end-date-picker]').should('have.value', '8/22/2019');

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
});
