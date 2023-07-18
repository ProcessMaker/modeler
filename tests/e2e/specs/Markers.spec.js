import { clickAndDropElement, getElementAtPosition, toggleInspector, typeIntoTextInput, waitToRenderAllShapes } from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Markers', () => {
  it('Add a task with a custom book marker', () => {
    const taskPosition = { x: 300, y: 200 };
    clickAndDropElement(nodeTypes.taskWithMarker, taskPosition);
    waitToRenderAllShapes();

    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.taskWithMarker);
    getElementAtPosition(taskPosition)
      .find('image[joint-selector*=topRight]:first')
      .should('have.attr', 'xlink:href')
      .and('match', /^data:image\/svg\+xml;/);
  });

  it('Dynamically remove custom book marker', () => {
    const taskPosition = { x: 300, y: 200 };
    clickAndDropElement(nodeTypes.taskWithMarker, taskPosition);
    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.taskWithMarker);

    getElementAtPosition(taskPosition).click();
    toggleInspector();
    typeIntoTextInput('[name=name]', 'Task without Marker');

    getElementAtPosition(taskPosition)
      .find('image[joint-selector*=topRight]:first')
      .then($el => {
        expect($el).to.have.attr('xlink:href');
      });
  });

  it('A task could have multiple custom markers', () => {
    const taskPosition = { x: 300, y: 200 };
    clickAndDropElement(nodeTypes.taskWithMarker, taskPosition);
    waitToRenderAllShapes();
    getElementAtPosition(taskPosition).getType().should('equal', nodeTypes.taskWithMarker);

    getElementAtPosition(taskPosition).click();

    toggleInspector();
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
