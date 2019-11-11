export default {
  props: ['highlighted'],
  methods: {
    hideLabel() {
      if (!this.highlighted) {
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

    this.$once('click', () => {
      this.shape.once('change:position', this.hideLabel);
    });
    this.shape.listenTo(this.paper, 'cell:pointerup blank:pointerup', this.showLabel);
    this.shape.once('change:parent', this.showLabel);
  },
};
