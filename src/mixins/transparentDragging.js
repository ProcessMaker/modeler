const transparentHighlighter = {
  highlighter: {
    name: 'addClass',
    options: {
      className: 'transparent-cell',
    },
  },
};

export default {
  data() {
    return {
      hasTransparency: false,
    };
  },
  methods: {
    initTransparentDragging() {
      this.graph.on('change:position', (model) => {
        this.addTransparency(model);
      });

      this.paperManager.addEventHandler('element:pointerup', (view) => {
        this.removeTransparency(view);
      });

      this.$on('node-added', (node) => {
        const nodeId = node.definition.id;
        const element = this.getElementByNodeId(nodeId);
        const view = this.paper.findViewByModel(element);
        this.removeTransparency(view);
      });
    },
    addTransparency(model) {
      if (this.hasTransparency) {
        return;
      }
      const view = this.paper.findViewByModel(model);
      view.highlight(null, transparentHighlighter);
      this.hasTransparency = true;
    },
    removeTransparency(view) {
      view.unhighlight(null, transparentHighlighter);
      this.hasTransparency = false;
    },
  },
};