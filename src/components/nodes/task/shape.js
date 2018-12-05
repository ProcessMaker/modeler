import joint from 'jointjs';

export default joint.shapes.standard.Rectangle.extend({

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

  defaults: joint.util.deepSupplement({

    type: 'processmaker.components.nodes.task.Shape',
    size: { width: 100, height: 60 },
    attrs: {
      'image': { 'ref-x': 4, 'ref-y': 4, ref: 'rect', width: 16, height: 16 },
    },

  }, joint.shapes.standard.Rectangle.prototype.defaults),
}); 
