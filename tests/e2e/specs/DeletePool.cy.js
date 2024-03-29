import {
  clickAndDropElement,
  getElementAtPosition,
  getCrownButtonForElement,
  typeIntoTextInput,
  removeIndentationAndLinebreaks,
  waitToRenderAllShapes,
  toggleInspector,
} from '../support/utils';
import { nodeTypes } from '../support/constants';

describe('Pools', { scrollBehavior: false }, () => {
  beforeEach(() => {
    toggleInspector();
  });

  it('Test Delete Pool should delete lanes', () => {
    const pool = addPool();
    addLane(pool);
    inspector(getLane(pool, 0), 'name', 'lane1');
    inspector(getLane(pool, 1), 'name', 'lane2');
    choose(pool);
    crown('delete-button');
    getBpmn().then(xml => {
      expect(xml).to.not.contain('<bpmn:laneSet');
      expect(xml).to.not.contain('<bpmn:lane');
      expect(xml).to.not.contain('<bpmn:startEvent');
    });
  });
});

function addPool()
{
  return new Cypress.Promise(resolve => {
    const poolPosition = { x: 300, y: 300 };
    clickAndDropElement(nodeTypes.pool, poolPosition);
    waitToRenderAllShapes();

    getElementAtPosition(poolPosition, nodeTypes.pool).then(element => {
      resolve(element);
    });
  });
}

function addLane(pool)
{
  pool.then(element => {
    cy.get(element).click()
      .then($pool => {
        getCrownButtonForElement($pool, 'lane-below-button').click({ force: true });
      });
  });
}

function inspector(shape, name, value)
{
  shape.then(element => {
    cy.get(element).click().then(() => {
      typeIntoTextInput(`[name=${name}]`, value);
    });
  });
}

function getLane(pool, index)
{
  return new Cypress.Promise(resolve => {
    pool.then(element => {
      cy.get(element).parent().find('[data-type=PoolLane]').eq(index).then(lane => {
        resolve(lane);
      });
    });
  });
}

function choose(shape)
{
  shape.then(element => {
    cy.get(element).click({ force: true });
  });
}

function crown(buttonId)
{
  getCrownButtonForElement(null, buttonId).click({ force: true });
}

function getBpmn()
{
  return new Cypress.Promise(resolve => {
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(removeIndentationAndLinebreaks)
      .then(xml => {
        resolve(xml);
      });
  });
}
