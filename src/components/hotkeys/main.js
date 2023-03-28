import ZoomInOut from './zoomInOut';
import store from '@/store';
import moveShapeByKeypress from './moveWithArrowKeys';

export default {
  mixins: [ZoomInOut],
  mounted() {
    document.addEventListener('keydown', this.keydownListener);
  },
  methods: {
    handleHotkeys(event, options) {
      // Pass event to all handlers
      this.zoomInOutHandler(event, options);
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

      moveShapeByKeypress(
        event.key,
        store.getters.highlightedShapes,
        this.pushToUndoStack,
      );
    },
  },
};