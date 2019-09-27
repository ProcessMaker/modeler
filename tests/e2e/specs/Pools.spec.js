import {
  connectNodesWithFlow,
  dragFromSourceToDest,
  getCrownButtonForElement,
  getElementAtPosition,
  moveElement,
  removeIndentationAndLinebreaks,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Pools', () => {
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

    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-above-button').click({ force: true });
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });
  });

  it('Can drag elements between pools', function() {
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

  it('Removes all references to element from lane', function() {
    const poolPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition)
      .click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });

    const nonEmptyLane = '<bpmn:lane id="node_3" name=""><bpmn:flowNodeRef>node_1</bpmn:flowNodeRef></bpmn:lane>';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(nonEmptyLane);
      });

    const startEventPosition = { x: 150, y: 150 };
    getElementAtPosition(startEventPosition)
      .click()
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click();
      });

    const emptyLane = '<bpmn:lane id="node_3" name="" />';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(emptyLane);
        expect(xml).to.not.contain('node_1');
      });
  });

  it('Removes all references to element from a pool', function() {
    const poolPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const startEventPosition = { x: 150, y: 150 };
    getElementAtPosition(startEventPosition).click().then($startEvent => {
      getCrownButtonForElement($startEvent, 'delete-button').click();
    });

    const startEvent = '<bpmn:startEvent id="node_1" name="Start Event" />';
    const emptyPool = '<bpmn:participant id="node_2" name="New Pool" processRef="Process_1" />';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window().its('xml').then(removeIndentationAndLinebreaks).then(xml => {
      expect(xml).to.contain(emptyPool);
      expect(xml).to.not.contain(startEvent);
    });
  });
});
