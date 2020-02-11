import { g, shapes } from 'jointjs';
import store from '@/store';
import {
  alignBottom,
  alignLeft,
  alignRight,
  alignTop,
  centerX,
  centerY, distributeHorizontalCentersEvenly, distributeHorizontalSpacingEvenly,
  distributeVerticalCentersEvenly,
} from '@/components/nodes/utilities/AlignShapes';

const shapesToNotTranslate = [
  'processmaker.modeler.bpmn.pool',
  'PoolLane',
  'processmaker.components.nodes.boundaryEvent.Shape',
];

export default function setUpSelectionBox(setCursor, resetCursor, paperManager, graph) {
  let initialPositionByGerrie;
  let shiftKeyPressed = false;
  let selectionBox;
  let selectionboxMousedownPosition;

  document.addEventListener('keydown', shiftKeyDownListener);
  document.addEventListener('keyup', shiftKeyUpListener);
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

  function shiftKeyDownListener(event) {

    const highlightedShapes = store.getters.highlightedShapes;
    switch (event.key) {
      case 'l':
        alignLeft(highlightedShapes);
        return;
      case 'r':
        alignRight(highlightedShapes);
        return;
      case 't':
        alignTop(highlightedShapes);
        return;
      case 'b':
        alignBottom(highlightedShapes);
        return;
      case 'x':
        centerX(highlightedShapes);
        return;
      case 'y':
        centerY(highlightedShapes);
        return;
      case 'X':
        distributeVerticalCentersEvenly(highlightedShapes);
        return;
      case 'Y':
        distributeHorizontalSpacingEvenly(highlightedShapes);
        return;
      case 'U':
        distributeHorizontalCentersEvenly(highlightedShapes);
        return;
    }

    if (event.key !== 'Shift' || shiftKeyPressed) {
      return;
    }

    setCursor();
    shiftKeyPressed = true;
    paperManager.preventTranslate = true;
    paperManager.paper.setInteractivity(false);
  }

  function shiftKeyUpListener({ key }) {
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

    selectionboxMousedownPosition = paperManager.clientToGridPoint(clientX, clientY);
  }

  function mousemoveListener({ clientX, clientY }) {
    if (!selectionboxMousedownPosition) {
      return;
    }

    if (selectionBox) {
      graph.removeCells(selectionBox);
    }

    const { x, y } = paperManager.clientToGridPoint(clientX, clientY);
    selectionBox = createSelectionBox(selectionboxMousedownPosition, { x, y });
    graph.addCell(selectionBox);
  }

  function mouseupListener() {
    selectionboxMousedownPosition = null;

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

  function createSelectionBox(p1, p2) {
    const { x, y, width, height } = new g.Line(p1, p2).bbox();

    return new shapes.standard.Rectangle({
      position: { x, y },
      size: { width, height },
      attrs: {
        body: {
          fill: 'lightblue',
          opacity: 0.3,
          stroke: 'blue',
          strokeWidth: 1,
        },
      },
    });
  }
}
