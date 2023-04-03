export default {
  props: {
    isActive: Boolean,
  },
  methods: {
    hideLabel(element, newPosition, options) {
      if (!this.isActive || options.movedWithArrowKeys) {
        return;
      }

      this.shape.attr('label/display', 'none');
      this.shape.getEmbeddedCells()
        .filter(element => element.attr('label/text'))
        .forEach((element) => {
          element.attr('label/display', 'none');
        });
    },
    async showLabel() {
      this.shape.attr('label/display', 'initial');
      await this.$nextTick();
      this.shape.once('change:position', this.hideLabel);
    },
  },
  async mounted() {
    await this.$nextTick();
  },
};
