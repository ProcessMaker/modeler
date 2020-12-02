import {
  assertDownloadedXmlContainsExpected,
  dragFromSourceToDest, uploadXml,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

function assertBottomCenterTaskMarkerHasImage(iconName, markerIndex = 0) {
  cy.get(`.main-paper [data-type="processmaker.components.nodes.task.Shape"] [joint-selector="bottomCenter.${markerIndex}"]`)
    .should('have.attr', 'xlink:href')
    // eslint-disable-next-line no-useless-escape
    .and('match', new RegExp(`${iconName}.*\.svg`));
}

describe('Task Marker Flags', () => {
  beforeEach(() => {
    const taskPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    cy.contains('Advanced').click();
  });

  it('sets a task as "parallel multi-instance"', () => {
    cy.get('[data-test=parallel_mi]').check({ force: true });
    cy.get('[data-test=for-compensation').uncheck({ force: true });

    assertDownloadedXmlContainsExpected('<bpmn:multiInstanceLoopCharacteristics />');
    assertBottomCenterTaskMarkerHasImage('parallel');
  });

  it('sets a task as "sequential multi-instance"', () => {
    cy.get('[data-test=sequential_mi]').check({ force: true });
    cy.get('[data-test=for-compensation').uncheck({ force: true });

    assertDownloadedXmlContainsExpected('<bpmn:multiInstanceLoopCharacteristics isSequential="true" />');
    assertBottomCenterTaskMarkerHasImage('sequential');
  });

  it('sets a task as "standard loop"', () => {
    cy.get('[data-test=loop]').check({ force: true });
    cy.get('[data-test=for-compensation').uncheck({ force: true });

    assertDownloadedXmlContainsExpected('<bpmn:standardLoopCharacteristics />');
    assertBottomCenterTaskMarkerHasImage('loop');
  });

  it('sets a task as "for compensation"', () => {
    cy.get('[data-test=for-compensation').check({ force: true });
    assertDownloadedXmlContainsExpected('<bpmn:task id="node_2" name="Form Task" isForCompensation="true" pm:assignment="requester" />');
    assertBottomCenterTaskMarkerHasImage('compensation');
  });

  it('keeps compensation as the leftmost of the center icons', () => {
    cy.get('[data-test=loop]').check({ force: true });
    cy.get('[data-test=for-compensation').check({ force: true });

    assertBottomCenterTaskMarkerHasImage('compensation');
    assertBottomCenterTaskMarkerHasImage('loop', '1');
  });

  it.only('can still set "for compensation" after undo/redo', () => {
    uploadXml('withLoopMarker.xml');

    cy.get('.main-paper [data-type="processmaker.components.nodes.task.Shape"]').click();
    cy.contains('Advanced').click();
    cy.get('[data-test=for-compensation').check({ force: true });

    assertBottomCenterTaskMarkerHasImage('compensation');
    assertBottomCenterTaskMarkerHasImage('loop', 1);
    assertDownloadedXmlContainsExpected('<bpmn:task id="node_1" name="Form Task" isForCompensation="true" pm:assignment="requester" />');
  });

});
