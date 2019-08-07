import { shapes, util } from 'jointjs';

export default shapes.standard.Rectangle.extend({
  markup: [{
    tagName: 'rect',
    selector: 'body',
  }, {
    tagName: 'text',
    selector: 'label',
  }, {
    tagName: 'image',
    selector: 'image',
  }],

  defaults: util.deepSupplement({
    type: 'processmaker.components.nodes.task.Shape',
    size: { width: 100, height: 60 },
    attrs: {
      'image': { 'ref-x': 4, 'ref-y': 4, ref: 'rect', width: 16, height: 16 },
    },

  }, shapes.standard.Rectangle.prototype.defaults),
});
