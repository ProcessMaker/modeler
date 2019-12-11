import {
  dragFromSourceToDest,
  getElementAtPosition,
  getComponentsEmbeddedInShape,
  getPositionInPaperCoords,
  waitToRenderAllShapes,
  setBoundaryEvent,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Boundary Error Event', () => {
  it('Can only have one boundary error event per task', function() {
    const taskPosition = { x: 250, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    getElementAtPosition(taskPosition, nodeTypes.task)
      .then(getComponentsEmbeddedInShape)
      .should($elements => {
        expect($elements).to.have.lengthOf(0);
      });

    const boundaryErrorEventPosition = { x: taskPosition.x + 10, y: taskPosition.y + 10 };
    setBoundaryEvent(nodeTypes.boundaryErrorEvent, taskPosition);

    getElementAtPosition(taskPosition, nodeTypes.task)
      .then(getComponentsEmbeddedInShape)
      .should($elements => {
        expect($elements).to.have.lengthOf(1);
      });

    setBoundaryEvent(nodeTypes.boundaryErrorEvent, taskPosition);

    getElementAtPosition(taskPosition, nodeTypes.task)
      .then(getComponentsEmbeddedInShape)
      .should($elements => {
        expect($elements).to.have.lengthOf(1);
      });

    const task2Position = { x: 450, y: 200 };
    dragFromSourceToDest(nodeTypes.task, task2Position);

    const boundaryErrorEvent2Position = { x: task2Position.x + 10, y: task2Position.y + 10 };

    getElementAtPosition(boundaryErrorEventPosition, nodeTypes.boundaryErrorEvent).then($boundaryEvent => {
      getPositionInPaperCoords(boundaryErrorEvent2Position).then(position => {
        cy.wrap($boundaryEvent)
          .trigger('mousedown', { which: 1, force: true })
          .trigger('mousemove', { clientX: position.x, clientY: position.y, force: true })
          .trigger('mouseup')
          .then(waitToRenderAllShapes)
          .then(() => {
            getElementAtPosition(taskPosition, nodeTypes.task)
              .then(getComponentsEmbeddedInShape)
              .should($elements => {
                expect($elements).to.have.lengthOf(0);
              });

            getElementAtPosition(task2Position, nodeTypes.task)
              .then(getComponentsEmbeddedInShape)
              .should($elements => {
                expect($elements).to.have.lengthOf(1);
              });
          });
      });
    });

    setBoundaryEvent(nodeTypes.boundaryErrorEvent, taskPosition);

    const task2Position2 = { x: task2Position.x + 50, y: task2Position.y + 50 };

    getElementAtPosition(boundaryErrorEventPosition, nodeTypes.boundaryErrorEvent).then($boundaryEvent => {
      getPositionInPaperCoords(task2Position2).then(position => {
        cy.wrap($boundaryEvent)
          .trigger('mousedown', { which: 1, force: true })
          .trigger('mousemove', { clientX: position.x, clientY: position.y, force: true })
          .trigger('mouseup')
          .then(waitToRenderAllShapes)
          .then(() => {
            getElementAtPosition(taskPosition, nodeTypes.task)
              .then(getComponentsEmbeddedInShape)
              .should($elements => {
                expect($elements).to.have.lengthOf(1);
              });

            getElementAtPosition(task2Position, nodeTypes.task)
              .then(getComponentsEmbeddedInShape)
              .should($elements => {
                expect($elements).to.have.lengthOf(1);
              });
          });
      });
    });
  });
});
