import store from '@/store';

export default {
  methods: {
    initDocumentingIcons(iconParams) {
      const defaultParams = {
        labelX: '100px', // x position of the number inside the circle icon
        labelY: '-4px', // y position of the number inside the circle icon
      };

      const params = Object.assign({}, defaultParams, iconParams);

      const docElement = this.node?.definition?.documentation;
      const doc = Array.isArray(docElement)
        ? (docElement[0].text ?? '').trim()
        : (docElement ?? '').trim();

      const view = this.paper.findViewByModel(this.shape);
      view.model.attr({
        doccircle: {
          display:'none',
        },
        doclabel: {
          display: 'none',
          style: `text-anchor: middle; transform: translate(${params.labelX}, ${params.labelY});`,
          text: null,
        },
      });

      const interval = window.setInterval(() => {
        if (view.$('circle').length > 0 && store.getters.isForDocumenting) {
          view.model.attr({
            doccircle: {
              display:(doc ? 'block' : 'none'),
            },
            doclabel: {
              display: 'none',
            },
          });
          clearInterval(interval);
        }
      }, 200);
    },
  },
};