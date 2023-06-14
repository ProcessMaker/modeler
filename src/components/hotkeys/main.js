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
        this.isGrabbing = false;
        this.paperManager.removeEventHandler('blank:pointermove');
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
        this.isGrabbing = true;
        this.paperManager.addEventHandler('blank:pointermove', (event, x, y) => {
          if (!this.canvasDragPosition) {
            const scale = this.paperManager.scale;
            this.canvasDragPosition = { x: x * scale.sx, y: y * scale.sy };
          }
          if (this.canvasDragPosition && !this.clientLeftPaper) {
            this.paperManager.translate(
              event.offsetX - this.canvasDragPosition.x,
              event.offsetY - this.canvasDragPosition.y
            );
          }
        });
      }

      moveShapeByKeypress(
        event.key,
        store.getters.highlightedShapes,
        this.pushToUndoStack,
      );
    },
  },
};
