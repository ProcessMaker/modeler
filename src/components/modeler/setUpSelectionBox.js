import { shapes } from 'jointjs';
import store from '@/store';

const shapesToNotTranslate = [
  'processmaker.modeler.bpmn.pool',
  'PoolLane',
  'processmaker.components.nodes.boundaryEvent.Shape',
];

export default function setUpSelectionBox(setCursor, resetCursor, paperManager, graph) {
  let initialPositionByGerrie;

  document.addEventListener('keydown', shiftKeyDownListener);
  document.addEventListener('keyup', spacebarUpListener);
  document.addEventListener('mousedown', mousedownListener);
  document.addEventListener('mouseup', mouseupListener);
  document.addEventListener('mousemove', mousemoveListener);
  paperManager.addEventHandler('cell:pointerdown', cellView => {
    if (!cellView.model.component) {
      return;
    }

    initialPositionByGerrie = cellView.model.position();
    cellView.model.on('change:position', moveAllOtherHighlightedShapes);
  });
  paperManager.addEventHandler('cell:pointerup link:pointerup element:pointerup blank:pointerup', cellView => {
    if (!cellView.model) {
      return;
    }

    cellView.model.off('change:position', moveAllOtherHighlightedShapes);
  });

  let shiftKeyPressed = false;
  let selectionBox;

  function shiftKeyDownListener(event) {
    if (event.key !== 'Shift' || shiftKeyPressed) {
      return;
    }

    setCursor();
    shiftKeyPressed = true;
    paperManager.preventTranslate = true;
    paperManager.paper.setInteractivity(false);
  }

  function spacebarUpListener({ key }) {
    if (key !== 'Shift' || !shiftKeyPressed) {
      return;
    }

    resetCursor();
    shiftKeyPressed = false;
    paperManager.preventTranslate = false;
    paperManager.paper.setInteractivity(graph.get('interactiveFunc'));
  }

  function mousedownListener({ clientX, clientY }) {
    if (!shiftKeyPressed) {
      return;
    }

    const { x, y } = paperManager.clientToGridPoint(clientX, clientY);
    selectionBox = new shapes.standard.Rectangle({
      position: { x, y },
      attrs: {
        body: {
          fill: 'lightblue',
          opacity: 0.3,
          stroke: 'blue',
          strokeWidth: 1,
        },
      },
    });
    graph.addCell(selectionBox);
  }

  function mousemoveListener({ clientX, clientY }) {
    if (!selectionBox) {
      return;
    }

    const { x, y } = paperManager.clientToGridPoint(clientX, clientY);
    const { x: shapeX, y: shapeY } = selectionBox.position();
    const width = Math.abs(x - shapeX);
    const height = Math.abs(y - shapeY);

    selectionBox.resize(width, height);
  }

  function mouseupListener() {
    if (!selectionBox) {
      return;
    }

    const selectedNodes = paperManager.paper
      .findViewsInArea(selectionBox.getBBox(), { strict: true })
      .filter(shape => shape.model.component)
      .map(shape => shape.model.component.node);

    store.commit('addToHighlightedNodes', selectedNodes);

    graph.removeCells(selectionBox);
    selectionBox = null;
  }

  function moveAllOtherHighlightedShapes(element, newPosition, { movedWithArrowKeys }) {
    if (
      movedWithArrowKeys ||
      shapesToNotTranslate.includes(element.get('type')) ||
      !store.getters.highlightedShapes.includes(element) ||
      element.component.node.pool
    ) {
      return;
    }

    const { x, y } = initialPositionByGerrie;
    const dx = newPosition.x - x;
    const dy = newPosition.y - y;

    store.getters.highlightedShapes
      .filter(shape => shape !== element && !shapesToNotTranslate.includes(shape.get('type')))
      .forEach(shape => shape.translate(dx, dy));

    initialPositionByGerrie = newPosition;
  }
}
