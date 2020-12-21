import {
  addNodeTypeToPaper,
  dragFromSourceToDest,
  getElementAtPosition,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

const switchToTaskType = {
  'processmaker-modeler-task': 'switch-to-user-task',
  'processmaker-modeler-manual-task': 'switch-to-manual-task',
  'processmaker-modeler-script-task': 'switch-to-script-task',
  'processmaker-modeler-call-activity': 'switch-to-sub-process',
};

const searchPlusSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGFyaWEtaGlkZGVuPSJ0cnVlIiBmb2N1c2FibGU9ImZhbHNlIiBkYXRhLXByZWZpeD0iZmFzIiBkYXRhLWljb249InNlYXJjaC1wbHVzIiBjbGFzcz0ic3ZnLWlubGluZS0tZmEgZmEtc2VhcmNoLXBsdXMgZmEtdy0xNiIgcm9sZT0iaW1nIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHBhdGggZmlsbD0iIzc4ODc5MyIgZD0iTTMwNCAxOTJ2MzJjMCA2LjYtNS40IDEyLTEyIDEyaC01NnY1NmMwIDYuNi01LjQgMTItMTIgMTJoLTMyYy02LjYgMC0xMi01LjQtMTItMTJ2LTU2aC01NmMtNi42IDAtMTItNS40LTEyLTEydi0zMmMwLTYuNiA1LjQtMTIgMTItMTJoNTZ2LTU2YzAtNi42IDUuNC0xMiAxMi0xMmgzMmM2LjYgMCAxMiA1LjQgMTIgMTJ2NTZoNTZjNi42IDAgMTIgNS40IDEyIDEyem0yMDEgMjg0LjdMNDc2LjcgNTA1Yy05LjQgOS40LTI0LjYgOS40LTMzLjkgMEwzNDMgNDA1LjNjLTQuNS00LjUtNy0xMC42LTctMTdWMzcyYy0zNS4zIDI3LjYtNzkuNyA0NC0xMjggNDRDOTMuMSA0MTYgMCAzMjIuOSAwIDIwOFM5My4xIDAgMjA4IDBzMjA4IDkzLjEgMjA4IDIwOGMwIDQ4LjMtMTYuNCA5Mi43LTQ0IDEyOGgxNi4zYzYuNCAwIDEyLjUgMi41IDE3IDdsOTkuNyA5OS43YzkuMyA5LjQgOS4zIDI0LjYgMCAzNHpNMzQ0IDIwOGMwLTc1LjItNjAuOC0xMzYtMTM2LTEzNlM3MiAxMzIuOCA3MiAyMDhzNjAuOCAxMzYgMTM2IDEzNiAxMzYtNjAuOCAxMzYtMTM2eiIvPjwvc3ZnPg==';

describe('customIcon', () => {
  const taskPosition = { x:250, y:250 };

  [nodeTypes.task, nodeTypes.manualTask, nodeTypes.scriptTask /*nodeTypes.subProcess*/].forEach(taskType => {
    it(`shows custom icon selector button in the color palette for ${taskType}`, () => {
      addNodeTypeToPaper(taskPosition, nodeTypes.task, switchToTaskType[taskType]);
      getElementAtPosition(taskPosition).click().getType().should('equal', taskType);

      cy.get('[data-test="picker-dropdown-button"]').click();
      cy.get('[data-test="set-custom-icon"').should('exist');
    });

  });

  it('can set custom icon for Form Task', () => {
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    cy.get('[data-test="picker-dropdown-button"]').click();
    cy.get('[data-test="set-custom-icon"]').click();

    cy.get('input.multiselect__input').click({ force: true }).type('{downarrow}{enter}{esc}');

    cy.get('footer> button.btn.btn-primary').click({ force: true });

    cy.get('[data-test="nodeIcon"]').should('have.attr', 'xlink:href')
      .and('equal', searchPlusSvg);
  });

});
