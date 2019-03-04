import {
  dragFromSourceToDest,
  typeIntoTextInput,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Parallel Gateway', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update parallel gateway name', () => {
    const testString = 'testing';
    const parallelGatewaySelector = '#v-21';

    dragFromSourceToDest(nodeTypes.parallelGateway, 200, 200);

    cy.get(parallelGatewaySelector).click({force: true});
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });
});
