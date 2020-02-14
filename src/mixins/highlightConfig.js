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

// simulation highlighters
const passedHighlighter = {
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
const simulationHighlither = {
  PASSED: {
    highlighter: {
      name: 'stroke',
      options: {
        padding: 10,
        attrs: {
          stroke: 'green',
          'stroke-width': 10,
          opacity: 0.3,
        },
      },
    },
  },
  COMPLETED: {
    highlighter: {
      name: 'stroke',
      options: {
        padding: 10,
        attrs: {
          stroke: 'lightgreen',
          'stroke-width': 10,
          opacity: 0.3,
        },
      },
    },
  },
  UNREACHABLE: {
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
  },
  LOOP: {
    highlighter: {
      name: 'stroke',
      options: {
        padding: 10,
        attrs: {
          stroke: 'yellow',
          'stroke-width': 10,
          opacity: 0.3,
        },
      },
    },
  },
  ACTIVE: {
    highlighter: {
      name: 'stroke',
      options: {
        padding: 10,
        attrs: {
          stroke: 'yellow',
          'stroke-width': 10,
          opacity: 0.3,
        },
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
    'simulationState',
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
      this.paperManager.awaitScheduledUpdates().then(this.setShapeHighlight);
    },
    autoValidate() {
      this.setShapeHighlight();
    },
    simulationState() {
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
      this.shapeView.unhighlight(this.shapeBody, passedHighlighter);
      if (this.hasPassed) {
        this.shapeView.highlight(this.shapeBody, passedHighlighter);
      }
      Object.keys(simulationHighlither).forEach( key => {
        const highlither = simulationHighlither[key];
        this.shapeView.unhighlight(this.shapeBody, highlither);
      });
      if (this.simulationState) {
        this.shapeView.highlight(this.shapeBody, simulationHighlither[this.simulationState]);
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
          });
        });
    });
  },
};
