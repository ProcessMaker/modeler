import { shapes, util } from 'jointjs';
import { markersMarkup, markersAttrs } from '@/mixins/hasMarkers';

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
  }, {
    tagName: 'circle',
    selector: 'doccircle',
  }, {
    tagName: 'text',
    selector: 'doclabel',
  },
  markersMarkup('topLeft'),
  markersMarkup('topCenter'),
  markersMarkup('topRight'),
  markersMarkup('bottomLeft'),
  markersMarkup('bottomCenter'),
  markersMarkup('bottomRight'),
  ],

  defaults: util.deepSupplement({
    type: 'processmaker.components.nodes.task.Shape',
    size: { width: 100, height: 60 },
    attrs: {
      'image': { 'ref-x': 4, 'ref-y': 4, ref: 'rect', width: 16, height: 16, 'data-test': 'nodeIcon' },
      'doclabel': {
        'ref-x': 92,
        'ref-y': -4, ref: 'rect', fontSize: 20, fontWeight: 'bold',
        width: 16, height: 16, 'data-test': 'nodeDocLabel', 'text':'',
        fill: 'white', display: 'none',
      },
      'doccircle': {
        'cx': 100, 'cy': 5, 'r': 10,
        'label': '7',
        'fill': '#8DC8FF', 'stroke': '#2B9DFF', 'strokeWidth': '3', 'display': 'none',
        ref: 'rect', width: 15, height: 15, 'data-test': 'nodeDocCircle' },
      ...markersAttrs('topLeft', { 'ref-y': 4, ref: 'rect' }),
      ...markersAttrs('topCenter', { 'ref-y': 4, ref: 'rect' }),
      ...markersAttrs('topRight', { 'ref-y': 4, 'ref-x': 96, ref: 'rect' }, -1),
      ...markersAttrs('bottomLeft', { ref: 'rect' }),
      ...markersAttrs('bottomCenter', { ref: 'rect' }),
      ...markersAttrs('bottomRight', { 'ref-x': 96, ref: 'rect' }, -1),
    },

  }, shapes.standard.Rectangle.prototype.defaults),
});
