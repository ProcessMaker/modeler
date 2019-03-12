import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Intermediate Message Catch Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update Name', () => {
    const testString = 'testing';
    const intermediateMessageCatchEventPosition = { x: 200, y: 200 };

    dragFromSourceToDest(nodeTypes.intermediateMessageCatchEvent, intermediateMessageCatchEventPosition);

    waitToRenderAllShapes();
    getElementAtPosition(intermediateMessageCatchEventPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });
});
