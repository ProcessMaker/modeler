const errorHighlighter = {
  highlighter: {
    name: 'stroke',
    options: {
      padding: 10,
      attrs: {
        stroke: 'red',
        'stroke-width': 10,
        opacity: 0.3,
      },
    },
  },
};

const defaultHighlighter = {
  highlighter: {
    name: 'stroke',
    options: {
      attrs: {
        stroke: '#5096db',
        'stroke-width': 3,
      },
    },
  },
};

export default {
  props: [
    'highlighted',
    'paperManager',
    'hasError',
    'autoValidate',
  ],
  data() {
    return {
      shape: null,
    };
  },
  watch: {
    highlighted() {
      this.setShapeHighlight();
    },
    hasError() {
      this.paperManager.executeAfterScheduledUpdates(this.setShapeHighlight);
    },
    autoValidate() {
      this.setShapeHighlight();
    },
  },
  computed: {
    shapeView() {
      return this.shape.findView(this.paperManager.paper);
    },
    shapeBody() {
      return this.shapeView.$el.find('[joint-selector=body]');
    },
  },
  methods: {
    setShapeHighlight() {
      if (!this.shapeView) {
        return;
      }
      this.shapeView.unhighlight(this.shapeBody, errorHighlighter);
      if (this.hasError && this.autoValidate) {
        this.shapeView.highlight(this.shapeBody, errorHighlighter);
      }
      this.shapeView.unhighlight(this.shapeBody, defaultHighlighter);
      if (this.highlighted) {
        this.shapeView.highlight(this.shapeBody, defaultHighlighter);
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.paperManager.executeAfterScheduledUpdates(() => {
        this.setShapeHighlight();
        this.shape.on('change:size', () => {
          this.paperManager.executeAfterScheduledUpdates(this.setShapeHighlight);
        });
      });
    });
  },
};
