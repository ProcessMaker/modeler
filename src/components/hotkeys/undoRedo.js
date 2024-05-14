export default {
  methods: {
    undoRedoHandler(event, options) {
      // Checking if the `key` property exists in the `event` object.
      if (!event.key) {
        return;
      }

      const key = event.key.toLowerCase();
      const isRedo = key === 'y';
      const isUndo= key === 'z';

      if (isUndo && options.mod) {
        this.undo(event);
      }
      if (isRedo && options.mod) {
        this.redo(event);
      }
    },
    undo(event) {
      event.preventDefault();
      this.$root.$emit('undo-keyboard-shortcut');
    },
    redo(event) {
      event.preventDefault();
      this.$root.$emit('redo-keyboard-shortcut');
    },
  },
};
