import { shapes, util } from 'jointjs';

export default shapes.standard.Circle.extend({

  markup: [{
    tagName: 'circle',
    selector: 'body',
  },{
    tagName: 'circle',
    selector: 'body2',
  }, {
    tagName: 'text',
    selector: 'label',
  }, {
    tagName: 'image',
    selector: 'image',
  }],

  defaults: util.deepSupplement({

    type: 'processmaker.components.nodes.boundaryEvent.Shape',
    size: { width: 36, height: 36 },
    attrs: {
      label: {
        refY: '130%',
      },
      body: {
        stroke: '#212529',
        strokeWidth: 0.85,
        fill: '#FFF',
      },
      body2: {
        cx: 18,
        cy: 18,
        r: 15,
        strokeWidth: 0.85,
        stroke: '#212529',
        fill: '#FFF',
      },
      image: {
        refX: 5,
        refY: 5,
        ref: 'circle',
        width: 26,
        height: 26,
      },
    },

  }, shapes.standard.Circle.prototype.defaults),
});
