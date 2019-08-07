import { shapes, util } from 'jointjs';

export default shapes.standard.Circle.extend({

  markup: [{
    tagName: 'circle',
    selector: 'body',
  }, {
    tagName: 'text',
    selector: 'label',
  }, {
    tagName: 'image',
    selector: 'image',
  }],

  defaults: util.deepSupplement({

    type: 'processmaker.components.nodes.startEvent.Shape',
    size: { width: 36, height: 36 },
    attrs: {
      'image': { 'ref-x': 5, 'ref-y': 5, ref: 'circle', width: 26, height: 26 },
    },

  }, shapes.standard.Circle.prototype.defaults),
});
