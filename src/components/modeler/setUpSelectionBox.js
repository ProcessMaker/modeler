import { shapes } from 'jointjs';
import store from '@/store';

const SPACEBAR = ' ';

export default function setUpSelectionBox(setCursor, resetCursor, paperManager, graph) {
  document.addEventListener('keydown', spacebarDownListener);
  document.addEventListener('keyup', spacebarUpListener);
  document.addEventListener('mousedown', mousedownListener);
  document.addEventListener('mouseup', mouseupListener);
  document.addEventListener('mousemove', mousemoveListener);

  paperManager.drawingSelectionBox = true;

  let spacebarPressed = false;
  let selectionBox;

  function spacebarDownListener(event) {
    if (event.key !== SPACEBAR || spacebarPressed) {
      return;
    }

    setCursor();
    spacebarPressed = true;
  }

  function spacebarUpListener({ key }) {
    if (key !== SPACEBAR || !spacebarPressed) {
      return;
    }

    resetCursor();
    spacebarPressed = false;
  }

  function mousedownListener({ clientX, clientY }) {
    if (!spacebarPressed) {
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

    const selectedNodes = graph
      .findModelsUnderElement(selectionBox)
      .map(element => element.component.node);

    store.commit('highlightNodes', selectedNodes);

    graph.removeCells(selectionBox);
    selectionBox = null;
  }
}
