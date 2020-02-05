import { shapes } from 'jointjs';
import store from '@/store';

export default function setUpSelectionBox(setCursor, resetCursor, paperManager, graph) {
  document.addEventListener('keydown', shiftKeyDownListener);
  document.addEventListener('keyup', spacebarUpListener);
  document.addEventListener('mousedown', mousedownListener);
  document.addEventListener('mouseup', mouseupListener);
  document.addEventListener('mousemove', mousemoveListener);

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
}
