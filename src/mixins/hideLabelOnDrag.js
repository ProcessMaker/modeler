export default {
  props: ['highlighted'],
  methods: {
    hideLabel() {
      if (!this.highlighted) {
        return;
      }

      this.shape.attr('label/display', 'none');
    },
    showLabel() {
      this.shape.attr('label/display', 'initial');
      this.shape.once('change:position', this.hideLabel);
    },
  },
  async mounted() {
    await this.$nextTick();

    this.shape.once('change:position', this.hideLabel);
    this.shape.listenTo(this.paper, 'cell:pointerup blank:pointerup', this.showLabel);
  },
};
