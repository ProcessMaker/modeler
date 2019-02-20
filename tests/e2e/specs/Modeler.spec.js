import {
  dragFromSourceToDest,
  getGraphElements,
  waitToRenderAllShapes,
  generateXML,
  connectNodesWithFlow,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Modeler', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Renders the application without errors', () => {
    cy.get('.navbar').should('contain', 'ProcessMaker Modeler');
  });

  it('Renders list of nodes', () => {
    const emptyChildrenCount = 2;

    cy.get('.modeler').children().should('have.length', emptyChildrenCount);

    nodeTypes.forEach(type => {
      dragFromSourceToDest(
        type,
        '.paper-container',
        200, 200
      );
    });
    cy.get('.modeler').children().should('have.length', emptyChildrenCount + nodeTypes.length);
  });

  it('Create a simple process', () => {
    /* Only the initial start element should exist */
    const initialNumberOfElements = 1;

    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    const taskPosition = { x: 300, y: 200 };
    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      taskPosition,
    );

    const startEventPosition = { x: 150, y: 150 };
    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);


    const task2Position = { x: 300, y: 350 };
    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      task2Position,
    );
    connectNodesWithFlow('sequence-flow-button', taskPosition, task2Position);

    const task3Position = { x: 100, y: 350 };
    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      task3Position,
    );
    connectNodesWithFlow('sequence-flow-button', task2Position, task3Position);

    const endEventPosition = { x: 100, y: 500 };
    dragFromSourceToDest(
      'processmaker-modeler-end-event',
      '.paper-container',
      endEventPosition,
    );
    connectNodesWithFlow('sequence-flow-button', task3Position, endEventPosition);

    dragFromSourceToDest(
      'processmaker-modeler-pool',
      '.paper-container',
      { x: 100, y: 100 },
    );

    waitToRenderAllShapes();

    const numberOfNewElementsAdded = 9;
    getGraphElements().should('have.length', initialNumberOfElements + numberOfNewElementsAdded);
  });

  it('Updates element name and validates xml', () => {
    const testString = 'testing';

    cy.get('.modeler').children().should('have.length', 2);
    cy.get('.joint-viewport').click();
    cy.get('[name=\'name\']').focus().clear().type(testString);
    cy.get('.joint-viewport').contains(testString);

    cy.get('[data-test=downloadXMLBtn]').click();
    const validXML = generateXML(testString);
    cy.window().its('xml').then(xml => xml.trim()).should('eq', validXML.trim());
  });

  it('Prevent element to connect to self', () => {
    /* Only the initial start element should exist */
    const initialNumberOfElements = 1;

    waitToRenderAllShapes();
    getGraphElements().should('have.length', initialNumberOfElements);

    const taskPosition = { x: 400, y: 300 };
    dragFromSourceToDest(
      'processmaker-modeler-task',
      '.paper-container',
      taskPosition
    );
    waitToRenderAllShapes();

    connectNodesWithFlow('sequence-flow-button', taskPosition, taskPosition);

    const numberOfNewElementsAdded = 1;
    getGraphElements().should('have.length', initialNumberOfElements + numberOfNewElementsAdded);
  });
});
