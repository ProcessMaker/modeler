import cloneDeep from 'lodash/cloneDeep';
import store from '@/store';

const COLOR_DEFAULT = '#5096db';
const COLOR_ERROR = '##FF0000';
const COLOR_IN_PROGRESS = '#1572C2';
const COLOR_IDLE = '#ced4da';
const COLOR_COMPLETED = '#00875A';
const COLOR_COMPLETED_FILL = '#edfffc';

const errorHighlighter = {
  highlighter: {
    name: 'stroke',
    options: {
      padding: 10,
      attrs: {
        stroke: COLOR_ERROR,
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
        stroke: COLOR_DEFAULT,
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
        stroke: COLOR_COMPLETED,
        'stroke-width': 3,
      },
    },
  },
};

const inProgressHighlighter = {
  highlighter: {
    name: 'stroke',
    options: {
      attrs: {
        stroke: COLOR_IN_PROGRESS,
        'stroke-width': 3,
        'stroke-dasharray': '4 4',
      },
    },
  },
};

const idleHighlighter = {
  highlighter: {
    name: 'stroke',
    options: {
      attrs: {
        stroke: COLOR_IDLE,
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
    'borderOutline',
    'isCompleted',
    'isInProgress',
    'isIdle',
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
          this.shape.attr('body/fill', COLOR_COMPLETED_FILL);
          this.shapeView.highlight(this.shapeBody, completedHighlighter);
        }
        this.shapeView.unhighlight(this.shapeBody, inProgressHighlighter);
        if (this.isInProgress) {
          this.shapeView.highlight(this.shapeBody, inProgressHighlighter);
        }
        if (this.isIdle) {
          this.shape.attr('body/fill', COLOR_IDLE);
          this.shapeView.highlight(this.shapeBody, idleHighlighter);
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
