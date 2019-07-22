import {
  dragFromSourceToDest,
  getElementAtPosition,
  getCrownButtonForElement,
  typeIntoTextInput,
  moveElement,
  waitToRenderAllShapes,
  removeIndentationAndLinebreaks,
  connectNodesWithFlow,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Pools', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update pool name', () => {
    const testString = 'testing';

    const poolPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition).click();

    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Can add top and bottom lane', () => {
    const poolPosition = { x: 300, y: 300 };

    // cy.get('[data-test=mini-map-btn]').click({ force: true});

    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-above-button').click({ force: true });
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });
  });

  it('Can drag elements between pools', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const startEventPosition = { x: 150, y: 150 };

    const pool1Position = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.pool, pool1Position);

    const startEventIn1stPool = '<bpmn:process id="Process_1" isExecutable="true"><bpmn:startEvent id="node_1" name="Start Event" /></bpmn:process>';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(startEventIn1stPool);
      });

    const pool2Position = { x: 200, y: 500 };
    dragFromSourceToDest(nodeTypes.pool, pool2Position);

    moveElement(startEventPosition, pool2Position);
    waitToRenderAllShapes();

    const empty1stPool = '<bpmn:process id="Process_1" isExecutable="true" />';
    const startEventIn2ndPool = '<bpmn:process id="process_2"><bpmn:startEvent id="node_1" name="Start Event" /></bpmn:process>';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(empty1stPool);
        expect(xml).to.contain(startEventIn2ndPool);
      });

    moveElement(pool2Position, startEventPosition);
    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition).click();

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(startEventIn1stPool);
      });

    waitToRenderAllShapes();
  });

  it('remove all references of flows when deleting a pool with a process', () => {
    const startEventPosition = { x: 150, y: 150 };
    const taskPosition = { x: 350, y: 350 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const poolPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);
    connectNodesWithFlow('sequence-flow-button', startEventPosition, taskPosition);

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'delete-button').click({ force: true });
      });

    const sequenceFlowReference = '<bpmn:sequenceFlow id="node_3" name="New Sequence Flow" sourceRef="node_1" targetRef="node_2" pm:startEvent="" />';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.not.contain(sequenceFlowReference);
      });
  });
});
