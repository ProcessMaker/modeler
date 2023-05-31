/* eslint-disable no-unused-vars */
import cloneDeep from 'lodash/cloneDeep';
import store from '@/store';

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

const completedHighlighter = {
  highlighter: {
    name: 'stroke',
    options: {
      attrs: {
        stroke: '#1572C2',
        'stroke-width': 2,
        'data-cy': 'completed',
      },
    },
  },
};

const inProgressHighlighter = {
  highlighter: {
    name: 'stroke',
    options: {
      attrs: {
        stroke: '#00875A',
        'stroke-width': 2,
        'stroke-dasharray': '4 4',
        'data-cy': 'in-progress',
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
    'isCompleted',
    'isInProgress',
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
      if (store.getters.isReadOnly) {
        this.shapeView.unhighlight(this.shapeBody, completedHighlighter);
        if (this.isCompleted) {
          this.shapeView.highlight(this.shapeBody, completedHighlighter);
        }
        this.shapeView.unhighlight(this.shapeBody, inProgressHighlighter);
        if (this.isInProgress) {
          this.shapeView.highlight(this.shapeBody, inProgressHighlighter);
        }
        return;
      }

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
      this.currentBorderOutline = borderOutline
        ? cloneDeep(borderOutline)
        : null;
      if (this.currentBorderOutline) {
        this.shapeView.highlight(this.shapeBody, this.currentBorderOutline);
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.paperManager.awaitScheduledUpdates().then(() => {
        this.setShapeHighlight();
        this.shape.on('change:size', () => {
          this.paperManager
            .awaitScheduledUpdates()
            .then(this.setShapeHighlight);
          this.$emit('shape-resize', this.shape);
        });
      });
    });
  },
};
