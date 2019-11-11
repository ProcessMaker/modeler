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
    'paper',
    'hasError',
    'isRendering',
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
      if (this.isRendering) {
        return;
      }

      this.setErrorHighlight();
    },
  },
  computed: {
    shapeView() {
      return this.shape.findView(this.paper);
    },
    shapeBody() {
      return this.shapeView.$el.find('[joint-selector=body]');
    },
  },
  methods: {
    setHighlight() {
      if (this.highlighted) {
        this.shapeView.highlight(this.shapeBody, {highlighter: defaultHighlighter});
        return;
      }

      this.shapeView.unhighlight(this.shapeBody, {highlighter: defaultHighlighter});
    },
    setErrorHighlight() {
      if (!this.shapeView) {
        return;
      }

      if (this.hasError) {
        this.shapeView.highlight(null, { highlighter: errorHighlighter });
      } else {
        this.shapeView.unhighlight(null, { highlighter: errorHighlighter });
      }
    },
    configureCrown() {
      if (!this.crownConfig) {
        this.crownConfig = [];
      }
      this.paper.once('render:done', () => this.setHighlight());

      const shapeView = this.shape.findView(this.paper);

      this.shape.on('change:size', () => {
        if (this.highlighted) {
          /* Ensure the highlight box expands to fit element */
          shapeView.unhighlight(this.shapeBody, { highlighter: defaultHighlighter });
          shapeView.highlight(this.shapeBody, { highlighter: defaultHighlighter });
        }
      });
    },
    setUpCrownConfig() {
      this.configureCrown();

      this.setErrorHighlight();
    },
  },
  mounted() {
    this.$nextTick(() => {
      /* Use nextTick to ensure this code runs after the component it is mixed into mounts.
       * This will ensure this.shape is defined. */

      if (this.isRendering) {
        this.paper.once('render:done', this.setUpCrownConfig);
      } else {
        this.setUpCrownConfig();
      }
    });
  },
};
