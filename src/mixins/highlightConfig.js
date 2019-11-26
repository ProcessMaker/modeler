const errorHighlighter = {
  name: 'stroke',
  options: {
    padding: 12,
    attrs: {
      stroke: 'red',
      'stroke-width': 3,
      opacity: 0.6,
    },
  },
};

const defaultHighlighter = {
  name: 'stroke',
  options: {
    attrs: {
      stroke: '#feb663',
      'stroke-width': 3,
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
      this.setHighlight();
    },
    hasError() {
      if (this.paperManager.hasScheduledUpdates()) {
        this.paperManager.addOnceHandler('render:done', this.setErrorHighlight);
        return;
      }
      this.setErrorHighlight();
    },
    autoValidate() {
      this.setErrorHighlight();
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
    setHighlight() {
      if (this.highlighted) {
        this.shapeView.highlight(this.shapeBody, { highlighter: defaultHighlighter });
        return;
      }

      this.shapeView.unhighlight(this.shapeBody, { highlighter: defaultHighlighter });
    },
    setErrorHighlight() {
      if (!this.shapeView) {
        return;
      }
      if (this.hasError && this.autoValidate) {
        this.shapeView.highlight(null, { highlighter: errorHighlighter });
        return;
      }
      this.shapeView.unhighlight(null, { highlighter: errorHighlighter });
    },
    setUpHighlightConfig() {
      this.setHighlight();
      this.setErrorHighlight();

      this.shape.on('change:size', () => {
        if (this.highlighted) {
          /* Ensure the highlight box expands to fit element */
          this.shapeView.unhighlight(this.shapeBody, { highlighter: defaultHighlighter });
          this.shapeView.highlight(this.shapeBody, { highlighter: defaultHighlighter });
        }
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      /* Use nextTick to ensure this code runs after the component it is mixed into mounts.
       * This will ensure this.shape is defined. */

      if (this.paperManager.hasScheduledUpdates()) {
        this.paperManager.addOnceHandler('render:done', this.setUpHighlightConfig());
        return;
      }
      this.setUpHighlightConfig();
    });
  },
};
