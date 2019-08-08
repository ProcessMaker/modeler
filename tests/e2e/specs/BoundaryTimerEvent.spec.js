import {
  dragFromSourceToDest,
  typeIntoTextInput,
  getElementAtPosition,
  removeIndentationAndLinebreaks,
  moveElement,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Boundary Timer Event', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Render a boundary timer event', function() {
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

  it('update properties element', function() {
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

  it('render boundary timer event by dragging intermediate event on task', function() {
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
});
