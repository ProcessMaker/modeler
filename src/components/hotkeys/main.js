import ZoomInOut from './zoomInOut';
import CopyPaste from './copyPaste.js';
import moveShapeByKeypress from './moveWithArrowKeys';
import EscKey from './escKey';
import store from '@/store';

export default {
  mixins: [ZoomInOut, CopyPaste, EscKey],
  computed: {
    clientLeftPaper() {
      return store.getters.clientLeftPaper;
    },
  },
  mounted() {
    document.addEventListener('keydown', this.keydownListener);
    document.addEventListener('keyup', this.keyupListener);
  },
  methods: {
    handleHotkeys(event, options) {
      // Pass event to all handlers
      this.zoomInOutHandler(event, options);
      this.copyPasteHandler(event, options);
      this.escapeKeyHandler(event);
    },
    keyupListener(event) {
      if (event.code === 'Space') {
        this.panMode = false;
      }
    },
    keydownListener(event) {
      // Check if either the Control key (Windows/Linux) or the Meta key (macOS) is pressed
      const isAppleOS = this.isAppleOS();
      const mod = isAppleOS ? event.metaKey : event.ctrlKey;
      let options = { mod, isAppleOS, modeler: this };
      try {
        this.handleHotkeys(event, options);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }

      const focusIsOutsideDiagram = !event.target.toString().toLowerCase().includes('body');
      if (focusIsOutsideDiagram) {
        return;
      }

      if (event.code === 'Space') {
        if (this.panMode) {
          return;
        }
        this.panMode = true;
      }

      moveShapeByKeypress(
        event.key,
        store.getters.highlightedShapes,
        this.pushToUndoStack,
      );
    },
    startPanning() {
      this.panning = true;
      this.paperManager.addEventHandler('blank:pointermove', this.blankMoveHandler);
      this.paperManager.addEventHandler('cell:pointermove', this.cellMoveHandler);
    },
    blankMoveHandler(event, x, y) {
      this.checkCanvasDragPosition(x, y);
      this.translatePaper(event);
    },
    cellMoveHandler(shape, event, x, y) {
      this.checkCanvasDragPosition(x, y);
      this.translatePaper(event);
    },
    checkCanvasDragPosition(x, y) {
      if (!this.canvasDragPosition) {
        const scale = this.paperManager.scale;
        this.canvasDragPosition = { x: x * scale.sx, y: y * scale.sy };
      }
    },
    translatePaper(event) {
      if (this.clientLeftPaper) {
        return;
      }
      this.paperManager.translate(
        event.offsetX - this.canvasDragPosition.x,
        event.offsetY - this.canvasDragPosition.y,
      );
    },
    stopPanning() {
      this.paperManager.removeEventHandler('blank:pointermove', this.blankMoveHandler);
      this.paperManager.removeEventHandler('cell:pointermove', this.cellMoveHandler);
      this.panning = false;
    },
  },
};
