import {
  uploadXml,
  waitToRenderAllShapes,
} from '../../../support/utils';
//   import { nodeTypes } from '../../../support/constants';

describe('Pool Selection', () => {
  it('test the result afte the pool was moved', () => {
    uploadXml('processs52.xml');
    waitToRenderAllShapes();
    
    // const poolPosition = {x:1000, y: 1000};
    // getPositionInPaperCoords(poolPosition);
    const offsetX = 100; // Amount to move the paper horizontally
    const offsetY = 50; // Amount to move the paper vertically

    cy.get('.paper-container')
      .trigger('mousedown', { button: 0, clientX: 0, clientY: 0 })
      .trigger('mousemove', { clientX: offsetX, clientY: offsetY })
      .trigger('mouseup', { button: 0, clientX: offsetX, clientY: offsetY });
    waitToRenderAllShapes();
    cy.get('body').type('{cmd}----------');
    // Select pool element
    // cy.get('.paper-container').as('paperContainer').click();
    // cy.get('[data-type="processmaker.modeler.bpmn.pool"]').click();
    // cy.get('.paper-container').trigger('mousemove', 'bottomRight');
    waitToRenderAllShapes();
  
    // cy.get('.paper-container').trigger('mouseup', 'bottomRight');

  });
});
  