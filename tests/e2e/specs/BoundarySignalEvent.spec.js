import {
  assertDownloadedXmlContainsExpected,
  dragFromSourceToDest,
  getElementAtPosition,
  setBoundaryEvent,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe.skip('Boundary Signal Event', () => {
  const taskPosition = { x: 200, y: 200 };
  const boundarySignalEventPosition = { x: 260, y: 200 };

  beforeEach(() => {
    dragFromSourceToDest(nodeTypes.task, taskPosition);
    setBoundaryEvent(nodeTypes.boundarySignalEvent, taskPosition);
  });

  it('update boundary signal event properties element', () => {
    const name = 'Test name';
    typeIntoTextInput('[name=name]', name);

    assertDownloadedXmlContainsExpected(`
      <bpmn:boundaryEvent id="node_3" name="${ name }" attachedToRef="node_2">
        <bpmn:signalEventDefinition />
      </bpmn:boundaryEvent>
    `);
  });

  it('can toggle interrupting on Boundary Signal Events', () => {
    const interrupting = '[name=cancelActivity]';
    cy.get(interrupting).should('be.checked');

    cy.get('[data-test=undo]').click({ force: true });
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click({ force: true });
    waitToRenderAllShapes();

    getElementAtPosition(boundarySignalEventPosition, nodeTypes.boundarySignalEvent).click();

    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({ force: true });
    cy.get(interrupting).should('not.be.checked');
  });
});
