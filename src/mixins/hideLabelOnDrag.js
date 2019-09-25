export default {
  props: ['highlighted'],
  methods: {
    hideLabel() {
      if (!this.highlighted) {
        return;
      }

      this.shape.attr('label/visibility', 'hidden');
    },
    showLabel() {
      this.shape.attr('label/visibility', 'visible');
      this.shape.once('change:position', this.hideLabel);
    },
  },
  async mounted() {
    await this.$nextTick();

    this.shape.once('change:position', this.hideLabel);
    this.shape.listenTo(this.paper, 'cell:pointerup blank:pointerup', this.showLabel);
  },
};
