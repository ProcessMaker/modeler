import store from '@/store';

export function docIconAdaptMarkup(markup, forDocumenting) {
  // Remove the icon tags from markup if modeler is in designer mode
  if (!forDocumenting) {
    return markup.filter(item => !['doccircle', 'doclabel'].includes(item.selector));
  }

  return markup;
}

export function docIconMarkup(selector) {
  const markups = [
    {
      tagName: 'circle',
      selector: 'doccircle',
    }, {
      tagName: 'text',
      selector: 'doclabel',
    },
  ];

  return markups.find(item => item.selector === selector);
}

export function docIconAttrs(selector, customValues) {
  const geometry = labelGeometry();
  const attrs = [
    {
      selector: 'doclabel',
      attributes: {
        'ref-x': geometry['ref-x'], 'ref-y': geometry['ref-y'], ref: 'circle',
        fontSize: geometry.fontSize, fontWeight: 'bold',
        width: 16, height: 16, 'data-test': 'nodeDocLabel', 'text':'',
        fill: 'white', display: 'none',
      },
    },
    {
      selector: 'doccircle',
      attributes: {
        'cx': 30, 'cy': 5, 'r': 10,
        'label': '7',
        'fill': '#8DC8FF', 'stroke': '#2B9DFF', 'strokeWidth': '3', 'display': 'none',
        ref: 'rect', width: 15, height: 15, 'data-test': 'nodeDocCircle',
      },
    },
  ];

  const selectorAttributes = attrs.find(item => item.selector === selector).attributes;

  let result = {};
  result[selector]  = { ...selectorAttributes, ...customValues };
  return result;
}

export default {
  methods: {
    initDocumentingIcons(iconParams) {
      if (!(store.getters.isForDocumenting ?? false)) {
        return;
      }
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

      const interval = window.setInterval(() => {
        if (view.$('circle').length > 0 && store.getters.isForDocumenting) {
          const nodeId = this?.node?.definition?.id;
          const nodeNumber = this.getNodeNumber(nodeId) + 1;

          view.model.attr({
            doccircle: {
              display:(doc ? 'block' : 'none'),
            },
            doclabel: {
              display: (store.getters.isForPrinting && doc ? 'block' : 'none'),
              style: `text-anchor: middle; transform: translate(${params.labelX}, ${params.labelY});`,
              text: (store.getters.isForPrinting ? nodeNumber : ''),
            },
          });
          clearInterval(interval);
        }
      }, 200);
    },

    initDocumentingIconsForFlow() {
      if (!(store.getters.isForDocumenting ?? false)) {
        return;
      }

      const docElement = this.node?.definition?.documentation;
      const doc = Array.isArray(docElement)
        ? (docElement[0].text ?? '').trim()
        : (docElement ?? '').trim();

      const geometry = labelGeometry();

      const interval = window.setInterval(() => {
        if (doc && store.getters.isForDocumenting) {
          const nodeId = this?.node?.definition?.id;
          const nodeNumber = this.getNodeNumber(nodeId) + 1;
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

          // add the node number when printing
          if (store.getters.isForPrinting) {
            this.shape.appendLabel({
              attrs: {
                rect: {
                  fill: 'none',
                  stroke: 'none',
                },
                text: {
                  text: nodeNumber,
                  fill: 'white',
                  fontSize: geometry.fontSize,
                  fontWeight: 'bold',
                  'font-size': geometry.fontSize,
                  'text-anchor': 'middle',
                  'y-alignment': 'middle',
                },
              },
              position: {
                distance: 40,
                offset: {
                  x: -20,
                  y: 1,
                },
              },
            });
          }

          clearInterval(interval);
        }
      }, 200);
    },

    getNodeNumber(nodeId) {
      const xmlString = window.ProcessMaker.$modeler.currentXML;

      const extractIds = (xml) => {
        const idRegex = /id="([^"]*)"/g;
        const ids = [];
        let match;
        while ((match = idRegex.exec(xml)) !== null) {
          ids.push(match[1]);
        }
        return ids;
      };

      const ids = extractIds(xmlString);

      return ids.indexOf(nodeId);
    },
  },
};

function labelGeometry() {
  if (store.getters.isForDocumenting && store.getters.isForPrinting) {
    return {
      fontSize: 12,
      forLink: {
        distance: 40,
        offset: { x: -10, y: 1 },
      },
      forGeneralShape : {
        'ref-x': 26,
        'ref-y': 0,
      },
    };
  }

  return {
    fontSize: 20,
    forLink: {
      distance: 40,
      offset: { x: -10, y: 1 },
    },
    forGeneralShape : {
      'ref-x': 26,
      'ref-y': -4,
    },
  };
}