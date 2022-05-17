import { dragFromSourceToDest, getElementAtPosition, typeIntoTextInput } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Markers', () => {
  it('Add a task with a custom book marker', () => {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.taskWithMarker, taskPosition);
    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.taskWithMarker);
    getElementAtPosition(taskPosition)
      .find('image[joint-selector*=topRight]:first')
      .should('have.attr', 'xlink:href')
      .and('match', /^data:image\/svg\+xml;/);
  });

  xit('Dynamically remove custom book marker', () => {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.taskWithMarker, taskPosition);
    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.taskWithMarker);

    getElementAtPosition(taskPosition).click();

    typeIntoTextInput('[name=name]', 'Task without Marker');

    getElementAtPosition(taskPosition)
      .find('image[joint-selector*=topRight]:first')
      .should('not.have.attr', 'xlink:href');

  });

  it('A task could have multiple custom markers', () => {
    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.taskWithMarker, taskPosition);
    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.taskWithMarker);

    getElementAtPosition(taskPosition).click();

    typeIntoTextInput('[name=name]', 'Task with two Markers');

    getElementAtPosition(taskPosition)
      .find('image[joint-selector*=topRight]:first')
      .should('have.attr', 'xlink:href')
      .and('match', /^data:image\/svg\+xml;/);
    getElementAtPosition(taskPosition)
      .find('image[joint-selector*=topRight]:nth-child(2)')
      .should('have.attr', 'xlink:href')
      .and('match', /^data:image\/svg\+xml;/);
  });
});
