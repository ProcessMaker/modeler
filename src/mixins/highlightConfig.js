import cloneDeep from 'lodash/cloneDeep';

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
        'data-cy': 'selected',
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
    'borderOutline',
  ],
  data() {
    return {
      shape: null,
      currentBorderOutline: null,
    };
  },
  watch: {
    highlighted() {
      this.setShapeHighlight();
    },
    hasError() {
      this.paperManager.awaitScheduledUpdates().then(this.setShapeHighlight);
    },
    autoValidate() {
      this.setShapeHighlight();
    },
    borderOutline: {
      deep: true,
      handler(borderOutline) {
        this.setBorderOutline(borderOutline);
      },
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
    setBorderOutline(borderOutline) {
      if (this.currentBorderOutline) {
        this.shapeView.unhighlight(this.shapeBody, this.currentBorderOutline);
      }
      this.currentBorderOutline = borderOutline ? cloneDeep(borderOutline) : null;
      if (this.currentBorderOutline) {
        this.shapeView.highlight(this.shapeBody, this.currentBorderOutline);
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.paperManager.awaitScheduledUpdates()
        .then(() => {
          this.setShapeHighlight();
          this.shape.on('change:size', () => {
            this.paperManager.awaitScheduledUpdates().then(this.setShapeHighlight);
            this.$emit('shape-resize', this.shape);
          });
        });
    });
  },
};
