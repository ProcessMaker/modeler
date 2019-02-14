import joint from 'jointjs';

export default joint.shapes.standard.Circle.extend({

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

  defaults: joint.util.deepSupplement({

    type: 'processmaker.components.nodes.intermediateEvent.Shape',
    size: { width: 36, height: 36 },
    attrs: {
      'body2': { cx: 18, cy: 18, r: 15, 'stroke-width': 2 },
      'image': { 'ref-x': 5, 'ref-y': 5, ref: 'circle', width: 26, height: 26 },
    },

  }, joint.shapes.standard.Circle.prototype.defaults),
});