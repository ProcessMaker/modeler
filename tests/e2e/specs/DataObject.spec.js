import {
  addNodeTypeToPaper,
  assertDownloadedXmlContainsExpected,
  dragFromSourceToDest,
  getElementAtPosition,
  modalCancel,
  modalConfirm,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe.only('Data Objects', () => {
  const taskPosition = {x: 250, y: 250};
  const testString = 'Test Data Object';

  it('can drag a data object on the the modeler', () => {
    dragFromSourceToDest(nodeTypes.dataObject, taskPosition);

    getElementAtPosition(taskPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });
});
