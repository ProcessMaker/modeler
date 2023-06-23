
import {
  clickAndDropElement,
  waitToRenderAllShapes,
} from '../../support/utils';
import { nodeTypes } from '../../support/constants';
describe.skip('Create Element' , () => {
  it('Verify if the number of the created elements is right', () => {
    const explorerX = 200;
    const startEventPosition = { x: 100 + explorerX, y: 100 };
    const taskFormPosition = {
      x: startEventPosition.x + 200,
      y: startEventPosition.y,
    };
    clickAndDropElement(nodeTypes.task, taskFormPosition);
    clickAndDropElement(nodeTypes.startEvent, startEventPosition);
    waitToRenderAllShapes();
    cy.get('.paper-container')
      .then(($paper) => {
        const elements = $paper.find('.joint-element');
        cy.wrap(elements).should('have.length', 3);
      });
  });
});
