import store from '@/store';

export default {
  methods: {
    initDocumentingIcons(iconParams) {
      const elementType = iconParams.elementType ?? '';

      if (elementType === 'flow') {
        this.initDocumentingIconsForFlow();
      }


      const defaultParams = {
        labelX: '100px', // x position of the number inside the circle icon
        labelY: '-4px', // y position of the number inside the circle icon
      };

      const params = { ...defaultParams, ...iconParams };

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

    initDocumentingIconsForFlow() {
      const docElement = this.node?.definition?.documentation;
      const doc = Array.isArray(docElement)
        ? (docElement[0].text ?? '').trim()
        : (docElement ?? '').trim();

      if (doc && store.getters.isForDocumenting) {
        this.shape.attr('line', {
          sourceMarker: {
            'type': 'circle',
            'fill': '#8DC8FF',
            'r': 10,
            'cx': 20,
            'stroke': '#2B9DFF',
            'stroke-width': 3,
          },
        });
      }
    },
  },
};