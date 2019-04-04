import {
  dragFromSourceToDest,
  typeIntoTextInput,
  waitToRenderAllShapes,
  getElementAtPosition,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Start Timer Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it.skip('Update properties on Start Timer Event', () => {
    const startTimerEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.startTimerEvent, startTimerEventPosition);

    waitToRenderAllShapes();

    getElementAtPosition(startTimerEventPosition).click();

    const testString = 'testing';
    typeIntoTextInput('[name=name]', testString);

    cy.contains('Timing Control').click();

    const startDate = '2019-02-06';
    typeIntoTextInput('.start-date', startDate);

    const time = '00:30';
    cy.get('.time').select(time, { force: true });
    typeIntoTextInput('.repeat', 3);

    cy.get('[data-test=day-1]').click();

    const timerExpression = '2019-02-05T13:00-05:00|R/2019-02-11T13:00-05:00/P3W|R/2019-02-07T13:00-05:00/P3W';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim())
      .should('contain', timerExpression);
  });
});
