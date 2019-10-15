import {
  dragFromSourceToDest,
  getElementAtPosition,
  waitToRenderAllShapes,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Boundary Escalation Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('can toggle interrupting on Boundary Escalation Events', function() {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryEscalationEventPosition = { x: 260, y: 260 };
    dragFromSourceToDest(nodeTypes.boundaryEscalationEvent, boundaryEscalationEventPosition);

    getElementAtPosition(boundaryEscalationEventPosition).click();

    const interrupting = '[name=cancelActivity]';
    cy.get(interrupting).should('be.checked');

    cy.get('[data-test=undo]').click({ force: true });
    waitToRenderAllShapes();
    cy.get('[data-test=redo]').click({ force: true });
    waitToRenderAllShapes();

    getElementAtPosition(boundaryEscalationEventPosition).click();

    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({ force: true });
    cy.get(interrupting).should('not.be.checked');

  });
});
