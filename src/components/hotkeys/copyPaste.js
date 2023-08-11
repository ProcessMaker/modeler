export default {
  methods: {
    copyPasteHandler(event, options) {
      const node = event.target.nodeName.toLowerCase();
      const isBody = node === 'body';
      const key = event.key.toLowerCase();
      const isCopy = key === 'c';
      const isPaste = key === 'v';

      if (isBody && isCopy && options.mod) {
        this.copy(event);
      }
      if (isBody && isPaste && options.mod) {
        this.paste(event);
      }
    },
    copy(event) {
      event.preventDefault();
      window.ProcessMaker.$modeler.copyElement();
    },
    paste(event) {
      event.preventDefault();
      window.ProcessMaker.$modeler.pasteElements();
    },
  },
};
