import { nodeTypes } from '../../support/constants';
const { clickAndDropElement, getElementAtPosition, waitToRenderAllShapes } = require('../../support/utils');

describe('Click and Drop' , () => {
  it('Elements are clicked and dropped into canvas', () => {
    const explorerX = 200;
    const task1Position = { x: 100 + explorerX, y: 200 };
    const task2Position = { x: 250 + explorerX, y: 200 };
    const endEventPosition = { x: 400 + explorerX, y: 200 };
    clickAndDropElement(nodeTypes.task, task1Position);
    clickAndDropElement(nodeTypes.task, task2Position);
    clickAndDropElement(nodeTypes.endEvent, endEventPosition);
    waitToRenderAllShapes();
    getElementAtPosition(task1Position).getType().should('equal', nodeTypes.task);
    getElementAtPosition(task2Position).getType().should('equal', nodeTypes.task);
    getElementAtPosition(endEventPosition).getType().should('equal', nodeTypes.endEvent);
  });
});
