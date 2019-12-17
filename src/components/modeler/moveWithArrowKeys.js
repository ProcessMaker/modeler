import store from '@/store';
import PaperManager from '@/components/paperManager';

export default function setUpArrowKeyEventHandlers() {
  document.addEventListener('keydown', event => {
    const highlightedShape = store.getters.nodeShape(store.getters.highlightedNode);
    if (!highlightedShape) {
      return;
    }

    highlightedShape.translate(...getPositionToMoveBy(event.key));
  });
}

function getPositionToMoveBy(key) {
  const moveAmount = PaperManager.gridSize / 2;

  if (['Up', 'ArrowUp'].includes(key)) {
    return [0, -moveAmount];
  }

  if (['Down', 'ArrowDown'].includes(key)) {
    return [0, moveAmount];
  }

  if (['Left', 'ArrowLeft'].includes(key)) {
    return [-moveAmount, 0];
  }

  if (['Right', 'ArrowRight'].includes(key)) {
    return [moveAmount, 0];
  }
}
