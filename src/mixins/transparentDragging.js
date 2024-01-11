import { highlighters, dia } from 'jointjs';

export default {
  data() {
    return {
      hasTransparency: {},
    };
  },
  methods: {
    initTransparentDragging() {
      this.paperManager.addEventHandler('cell:pointerup blank:pointerup', () => {
        this.removeTransparency();
      });

      this.graph.on('change:position', (model) => {
        this.addTransparency(model);
      });

      this.$on('node-added', (node) => {
        const nodeId = node.definition.id;
        const element = this.getElementByNodeId(nodeId);
        const view = this.paper.findViewByModel(element);
        this.removeTransparency(view);
      });
    },
    addTransparency(model) {
      if (model.id in this.hasTransparency) {
        return;
      }
      const view = this.paper.findViewByModel(model);
      highlighters.addClass.add(view, 'root', 'transparent-highlighter', { className: 'transparent-cell' });
      this.hasTransparency[model.id] = view;
    },
    removeTransparency() {
      let atLeastOneRemoved = false;
      Object.values(this.hasTransparency).forEach((view) => {
        dia.HighlighterView.remove(view, 'transparent-highlighter');
        atLeastOneRemoved = true;
      });
      if (atLeastOneRemoved) {
        this.paper.dumpViews();
      }
    },
  },
};