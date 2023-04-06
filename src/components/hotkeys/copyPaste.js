export default {
  methods: {
    copyPasteHandler(event, options) {
      const isCopy = event.key === 'c';
      const isPaste = event.key === 'v';

      if (isCopy && options.mod) {
        this.copy(event);
      }
      if (isPaste && options.mod) {
        this.paste(event);
      }
    },
    copy(event) {
      event.preventDefault();
    },
    paste(event) {
      event.preventDefault();
    },
  },
};
