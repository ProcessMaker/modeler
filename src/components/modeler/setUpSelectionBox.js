import { g, shapes } from 'jointjs';
import store from '@/store';
import { canMoveProgrammatically } from '@/components/nodes/utilities/shapeMovement';
import { getBoundingBox } from '@/components/nodes/utilities/shapeGroup';
const shapesToNotTranslate = [
  'processmaker.modeler.bpmn.pool',
  'PoolLane',
  'processmaker.components.nodes.boundaryEvent.Shape',
];

export default function setUpSelectionBox(setCursor, resetCursor, paperManager, graph) {
  let initialPosition;
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

    initialPosition = cellView.model.position();
    cellView.model.on('change:position', moveAllOtherHighlightedShapes);
  });
  paperManager.addEventHandler('cell:pointerup link:pointerup element:pointerup blank:pointerup', cellView => {
    if (!cellView.model) {
      return;
    }

    cellView.model.off('change:position', moveAllOtherHighlightedShapes);
  });

  function resetMultiSelect() {
    resetCursor();
    shiftKeyPressed = false;
    paperManager.preventTranslate = false;
    paperManager.paper.setInteractivity(graph.get('interactiveFunc'));
  }

  function shiftKeyDownListener(event) {
    if (event.shiftKey && (event.ctrlKey || event.altKey || event.metaKey)) {
      resetMultiSelect();
   
      return;
    }

    if (event.key !== 'Shift' || shiftKeyPressed) {
      return;
    }

    setCursor();
    console.log('init selection');
    shiftKeyPressed = true;
    graph.removeCells(selectionBox);
    paperManager.preventTranslate = true;
    paperManager.paper.setInteractivity(false);
  }

  function shiftKeyUpListener({ key }) {
    if (key !== 'Shift' || !shiftKeyPressed) {
      return;
    }
    resetMultiSelect();
  }

  function mousedownListener({ clientX, clientY }) {
   
    if (!shiftKeyPressed) {
      return;
    }
    console.log('mousedownListener');
    
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

    console.log('mousemoveListener');
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
    console.log('mouseupListener');
    console.log(paperManager.paper);
    
    store.commit('addToHighlightedNodes', selectedNodes);

    // graph.removeCells(selectionBox);
    // const shapes = paperManager.paper.findViewsInArea(
    //   selectionBox.getBBox(), { strict: true }).filter(shape => shape.model.component
    // );
    const boundingBox = getBoundingBox(store.getters.highlightedShapes);
    console.log(store.getters.highlightedShapes);
    console.log(boundingBox);
    selectionBox.position(boundingBox.left-2, boundingBox.top-2);
    selectionBox.resize(boundingBox.width +5,boundingBox.height+5);
    // selectionBox = null;
  }

  function moveAllOtherHighlightedShapes(element, newPosition, { movedWithArrowKeys }) {
    
    if (
      movedWithArrowKeys ||
      !canMoveProgrammatically(element) ||
      !store.getters.highlightedShapes.includes(element) ||
      element.component.node.pool
    ) {
      return;
    }
    console.log('moveAllOtherHighlightedShapes');
    const { x, y } = initialPosition;
    const dx = newPosition.x - x;
    const dy = newPosition.y - y;

    store.getters.highlightedShapes
      .filter(shape => shape !== element && !shapesToNotTranslate.includes(shape.get('type')))
      .forEach(shape => shape.translate(dx, dy));

    initialPosition = newPosition;
  }

  function createSelectionBox(p1, p2) {
    const { x, y, width, height } = new g.Line(p1, p2).bbox();

    return new shapes.standard.Rectangle({
      position: { x, y },
      size: { width, height },
      type: 'selectionBox',
      attrs: {
        body: {
          fill: 'lightblue',
          opacity: 0.3,
          stroke: 'blue',
          strokeWidth: 4,
        },
      },
    });
  }
}
