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

  it('sets a task as "for compensation"', () => {
    cy.get('[data-test=for-compensation').check({ force: true });
    assertDownloadedXmlContainsExpected('<bpmn:task id="node_2" name="Form Task" isForCompensation="true" pm:assignment="requester" />');
    assertBottomCenterTaskMarkerHasImage('compensation');
  });

  it('keeps compensation as the leftmost of the center icons', () => {
    cy.get('[data-test=for-compensation').check({ force: true });

    assertBottomCenterTaskMarkerHasImage('compensation');
  });

  it('can still set "for compensation" after undo/redo', () => {
    uploadXml('withLoopMarker.xml');

    cy.get('.main-paper [data-type="processmaker.components.nodes.task.Shape"]').click();
    cy.contains('Advanced').click();
    cy.get('[data-test=for-compensation').check({ force: true });

    assertBottomCenterTaskMarkerHasImage('compensation');
    assertBottomCenterTaskMarkerHasImage('loop', 1);
    assertDownloadedXmlContainsExpected(`
      <bpmn:task id="node_1" name="Form Task" isForCompensation="true" pm:assignment="requester">
        <bpmn:ioSpecification id="node_3_2">
          <bpmn:dataInput id="node_1_input_1" name="source_array" isCollection="true" />
            <bpmn:dataOutput id="node_1_output_1" name="output_array_node_1" isCollection="true" />
          <bpmn:inputSet id="node_6_5">
            <bpmn:dataInputRefs>node_1_input_1</bpmn:dataInputRefs>
          </bpmn:inputSet>
          <bpmn:outputSet id="node_7_6">
            <bpmn:dataOutputRefs>node_1_output_1</bpmn:dataOutputRefs>
          </bpmn:outputSet>
        </bpmn:ioSpecification>
        <bpmn:standardLoopCharacteristics id="node_2_1" />
      </bpmn:task>
    `);
  });
});
