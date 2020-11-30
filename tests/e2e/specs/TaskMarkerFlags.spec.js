import {
  assertDownloadedXmlContainsExpected,
  dragFromSourceToDest,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Task Marker Flags', () => {

  it('can set loop characteristics and compensation markers', () => {
    const taskPosition = { x: 250, y: 250 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    cy.contains('Advanced').click();
    cy.get('[data-test=loop]').check({ force: true });
    assertDownloadedXmlContainsExpected('<bpmn:standardLoopCharacteristics />');

    cy.get('.main-paper [data-type="processmaker.components.nodes.task.Shape"] [joint-selector="bottomCenter.0"]')
      .should('have.attr', 'xlink:href')
      .and('match',  /loop.*\.svg/);
  });
});
