import cloneDeep from 'lodash/cloneDeep';
import store from '@/store';
import {
  COLOR_DEFAULT,
  COLOR_ERROR,
  COLOR_IN_PROGRESS,
  COLOR_IN_PROGRESS_FILL,
  COLOR_IDLE,
  COLOR_IDLE_FILL,
  COLOR_COMPLETED,
  COLOR_COMPLETED_FILL,
} from '@/components/highlightColors.js';

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
        'stroke-width': 5,
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
        'stroke-width': 5,
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
        'stroke-width': 5,
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
      return this.shapeView.$el.find('[joint-selector=body]') || this.shapeView.$el;
    },
  },
  methods: {
    prepareCustomColorHighlighter(color) {
      return {
        highlighter: {
          name: 'stroke',
          options: {
            attrs: {
              stroke: color,
              'stroke-width': 3,
              'data-cy': 'selected',
            },
          },
          partial: false,
          type: 'default',
        },
      };
    },
    setHighlightColor(highlighted, color) {
      if (!this.shapeView) {
        return;
      }
      if (highlighted) {
        this.shapeView.unhighlight(this.shapeBody, errorHighlighter);
        this.shapeView.highlight(this.shapeBody, this.prepareCustomColorHighlighter(color));
      } else {
        this.shapeView.unhighlight(this.shapeBody, this.prepareCustomColorHighlighter(color));
      }
    },
    setAiStatusHighlight(status) {
      this.shapeView.unhighlight(this.shapeBody, completedHighlighter);
      if (status === 'generated') {
        this.shape.attr('body/fill', COLOR_COMPLETED_FILL);
        this.shapeView.highlight(this.shapeBody, completedHighlighter);
      }
      this.shapeView.unhighlight(this.shapeBody, inProgressHighlighter);
      if (status === 'generating') {
        this.shape.attr('body/fill', COLOR_IN_PROGRESS_FILL);
        this.shapeView.highlight(this.shapeBody, inProgressHighlighter);
      }
      this.shapeView.unhighlight(this.shapeBody, idleHighlighter);
      if (status === 'previously generated') {
        this.shape.attr('body/fill', COLOR_IDLE_FILL);
        this.shapeView.highlight(this.shapeBody, idleHighlighter);
      }
    },
    unsetHighlights() {
      this.shape.attr('body/fill', '#FFFFFF');
      this.shapeView.unhighlight(this.shapeBody, inProgressHighlighter);
      this.shapeView.unhighlight(this.shapeBody, completedHighlighter);
      this.shapeView.unhighlight(this.shapeBody, idleHighlighter);
    },
    setShapeHighlightForReadOnly() {
      if (!this.shapeView) {
        return;
      }
      this.shapeView.unhighlight(this.shapeBody, completedHighlighter);
      if (this.isCompleted) {
        this.shape.attr('body/fill', COLOR_COMPLETED_FILL);
        this.shapeView.highlight(this.shapeBody, completedHighlighter);
      }
      this.shapeView.unhighlight(this.shapeBody, inProgressHighlighter);
      if (this.isInProgress) {
        this.shape.attr('body/fill', COLOR_IN_PROGRESS_FILL);
        this.shapeView.highlight(this.shapeBody, inProgressHighlighter);
      }
      if (this.isIdle) {
        this.shape.attr('body/fill', COLOR_IDLE_FILL);
        this.shapeView.highlight(this.shapeBody, idleHighlighter);
      }
    },
    setShapeHighlightForDefault() {
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
    setShapeHighlight() {
      if (!this.shapeView) {
        return;
      }
      this.shapeView.unhighlight(this.shapeBody, errorHighlighter);
      if (store.getters.isReadOnly) {
        this.setShapeHighlightForReadOnly();
      } else {
        this.setShapeHighlightForDefault();
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
