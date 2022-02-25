import { dragFromSourceToDest, getComponentsEmbeddedInShape, getElementAtPosition, setBoundaryEvent } from '../support/utils';
import { nodeTypes } from '../support/constants';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';

describe('Boundary event validation', () => {
  it('should add boundary events to empty ports around boundary event target, and not allow adding any more', () => {
    const taskPosition = { x: 250, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const numberOfPortsAroundTask = 12;
    for (let i = 0; i < numberOfPortsAroundTask; i++) {
      setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);
    }

    getElementAtPosition(taskPosition, nodeTypes.task)
      .then(getComponentsEmbeddedInShape)
      .should($boundaryEvents => {
        const boundaryEventPositions = $boundaryEvents.toArray().map($boundaryEvent => {
          const { top, left } = $boundaryEvent.position();
          return { top, left };
        });

        expect(uniqWith(boundaryEventPositions, isEqual)).to.have.length(numberOfPortsAroundTask);
      });

    cy
      .get('.main-paper [data-type="processmaker.components.nodes.boundaryEvent.Shape"]')
      .should('have.length', numberOfPortsAroundTask);

    setBoundaryEvent(nodeTypes.boundaryTimerEvent, taskPosition);

    cy
      .get('.main-paper [data-type="processmaker.components.nodes.boundaryEvent.Shape"]')
      .should('have.length', numberOfPortsAroundTask);

    getElementAtPosition(taskPosition, nodeTypes.task).click({force:true});

    const dataTest = nodeTypes.boundaryTimerEvent.replace('processmaker-modeler-', 'add-');
    cy.get(`[data-test="${dataTest}"]`)
      .should('exist')
      .should('not.be.enabled');
  });
});
