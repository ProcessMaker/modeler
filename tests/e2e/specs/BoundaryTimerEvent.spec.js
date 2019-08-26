import {
  dragFromSourceToDest,
  connectNodesWithFlow,
  typeIntoTextInput,
  getElementAtPosition,
  removeIndentationAndLinebreaks,
  moveElement,
  moveElementRelativeTo,
  getCrownButtonForElement,
  getLinksConnectedToElement,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Boundary Timer Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it.skip('Render a boundary timer event', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 260, y: 260 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, boundaryTimerEventPosition);

    getElementAtPosition(boundaryTimerEventPosition).click();

    const boundaryTimerEventXML = '<bpmn:boundaryEvent id="node_4" name="New Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(boundaryTimerEventXML);
      });
  });

  it.skip('update properties element', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 260, y: 260 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, boundaryTimerEventPosition);

    getElementAtPosition(boundaryTimerEventPosition).click();

    const name = 'Test name';
    typeIntoTextInput('[name=name]', name);

    const timingControlAccordion = '.fa-clock';
    cy.get(timingControlAccordion).click();

    const durationValue = 4;
    typeIntoTextInput('.repeat', durationValue);

    const durationXML = '<bpmn:boundaryEvent id="node_4" name="Test name" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT4H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(durationXML);
      });

    cy.get('[data-test=intermediateTypeSelect]').select('Cycle');
    const cycleValue = '6';
    cy.get('[data-test=periods]').select('day');
    typeIntoTextInput('.repeat', cycleValue);

    const cycleXML = '<bpmn:boundaryEvent id="node_4" name="Test name" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeCycle>R/P6D</bpmn:timeCycle></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(cycleXML);
      });
  });

  it.skip('render boundary timer event by dragging intermediate event on task', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const taskPosition = { x: 200, y: 200 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const intermediateCatchEventPosition = { x: 300, y: 300 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, intermediateCatchEventPosition);

    moveElement(intermediateCatchEventPosition, 200, 200);

    const boundaryTimerEventXML = '<bpmn:boundaryEvent id="node_4" name="New Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();

    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(boundaryTimerEventXML);
      });
  });

  it.skip('removes references of itself when inside of a pool and deleting the pool', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }

    const startEventPosition = { x: 150, y: 150 };
    const poolPosition = { x: 400, y: 300 };
    const taskPosition = { x: 250, y: 250 };

    getElementAtPosition(startEventPosition)
      .click()
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click({ force: true });
      });

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, boundaryTimerEventPosition);

    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    getElementAtPosition(poolPosition)
      .click()
      .then($task => {
        getCrownButtonForElement($task, 'delete-button').click({ force: true });
      });

    const boundaryTimerEventInXML = '<bpmn:boundaryEvent id="node_4" name="New Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.not.contain(boundaryTimerEventInXML);
      });
  });

  it.skip('can stay anchored to task when moving pool', function() {
    if (Cypress.env('inProcessmaker')) {
      this.skip();
    }
    const startEventPosition = { x: 150, y: 150 };
    const poolPosition = { x: 300, y: 300 };
    const taskPosition = { x: 250, y: 250 };

    getElementAtPosition(startEventPosition)
      .click()
      .then($startEvent => {
        getCrownButtonForElement($startEvent, 'delete-button').click({ force: true });
      });

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, boundaryTimerEventPosition);

    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    const initialPositionXML = '<bpmn:boundaryEvent id="node_4" name="New Boundary Timer Event" attachedToRef="node_2"><bpmn:timerEventDefinition><bpmn:timeDuration>PT1H</bpmn:timeDuration></bpmn:timerEventDefinition></bpmn:boundaryEvent>';

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(initialPositionXML);
      });

    moveElementRelativeTo({x: 400, y: 400}, 150, 150);

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        expect(xml).to.contain(initialPositionXML);
      });
  });

  it('it can toggle interrupting on Boundary Timer Events', function() {
    const taskPosition = {x: 200, y: 200};
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    const boundaryTimerEventPosition = {x: 260, y: 260};
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, boundaryTimerEventPosition);

    getElementAtPosition(boundaryTimerEventPosition).click();

    const interrupting = '[name=cancelActivity]';
    cy.get(interrupting).should('be.checked');

    cy.get('[data-test=undo]').click({force: true});
    cy.get('[data-test=undo]').click({force: true});
    cy.get('[data-test=redo]').click({force: true});

    getElementAtPosition(boundaryTimerEventPosition).click();

    cy.get(interrupting).should('be.checked');
    cy.get(interrupting).uncheck({force: true});
    cy.get(interrupting).should('not.be.checked');

  });

  it('it retains outgoing sequence flows on Boundary Timer Events', function() {

    const taskForTimerPosition = {x: 200, y: 200};
    dragFromSourceToDest(nodeTypes.task, taskForTimerPosition);

    const outgoingTaskPosition = {x: 400, y: 400};
    dragFromSourceToDest(nodeTypes.task, outgoingTaskPosition);

    const boundaryTimerEventPosition = {x: 260, y: 260};
    dragFromSourceToDest(nodeTypes.intermediateCatchEvent, boundaryTimerEventPosition);

    connectNodesWithFlow('sequence-flow-button', boundaryTimerEventPosition, outgoingTaskPosition);

    const numberOfSequenceFlowsAdded = 1;

    getElementAtPosition(boundaryTimerEventPosition).then(getLinksConnectedToElement).should($links => {
      expect($links.length).to.eq(numberOfSequenceFlowsAdded);
    });

    cy.get('[data-test=undo]').click({force: true});
    cy.get('[data-test=redo]').click({force: true});

    getElementAtPosition(boundaryTimerEventPosition).then(getLinksConnectedToElement).should($links => {
      expect($links.length).to.eq(numberOfSequenceFlowsAdded);
    });


  });

  it('it cannot attach an incoming sequence flow on Boundary Timer Events');

  it('it can toggle interrupting on Boundary Timer Events in multiple processes');

});
