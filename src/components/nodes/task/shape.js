import { shapes, util } from 'jointjs';
import { markersMarkup, markersAttrs } from '@/mixins/hasMarkers';
import { docIconMarkup, docIconAttrs, docIconAdaptMarkup } from '@/mixins/documentingIcons';


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
      ...markersAttrs('topLeft', { 'ref-y': 4, ref: 'rect' }),
      ...markersAttrs('topCenter', { 'ref-y': 4, ref: 'rect' }),
      ...markersAttrs('topRight', { 'ref-y': 4, 'ref-x': 96, ref: 'rect' }, -1),
      ...markersAttrs('bottomLeft', { ref: 'rect' }),
      ...markersAttrs('bottomCenter', { ref: 'rect' }),
      ...markersAttrs('bottomRight', { 'ref-x': 96, ref: 'rect' }, -1),
    },
  }, shapes.standard.Rectangle.prototype.defaults),
});

export function getTaskShape(forDocumenting = false) {
  let markup = [{
    tagName: 'rect',
    selector: 'body',
  }, {
    tagName: 'text',
    selector: 'label',
  }, {
    tagName: 'image',
    selector: 'image',
  },
  docIconMarkup('doccircle'),
  docIconMarkup('doclabel'),
  markersMarkup('topLeft'),
  markersMarkup('topCenter'),
  markersMarkup('topRight'),
  markersMarkup('bottomLeft'),
  markersMarkup('bottomCenter'),
  markersMarkup('bottomRight'),
  ];

  markup = docIconAdaptMarkup(markup, forDocumenting);

  const TaskShapeClass = shapes.standard.Rectangle.extend({
    markup,
    defaults: util.deepSupplement({
      type: 'processmaker.components.nodes.task.Shape',
      size: { width: 100, height: 60 },
      attrs: {
        'image': { 'ref-x': 4, 'ref-y': 4, ref: 'rect', width: 16, height: 16, 'data-test': 'nodeIcon' },
        ...docIconAttrs('doclabel', { 'ref-x': 95, 'ref-y': -4 }),
        ...docIconAttrs('doccircle', { 'cx': 100, 'cy': 5 }),
        ...markersAttrs('topLeft', { 'ref-y': 4, ref: 'rect' }),
        ...markersAttrs('topCenter', { 'ref-y': 4, ref: 'rect' }),
        ...markersAttrs('topRight', { 'ref-y': 4, 'ref-x': 96, ref: 'rect' }, -1),
        ...markersAttrs('bottomLeft', { ref: 'rect' }),
        ...markersAttrs('bottomCenter', { ref: 'rect' }),
        ...markersAttrs('bottomRight', { 'ref-x': 96, ref: 'rect' }, -1),
      },
    }, shapes.standard.Rectangle.prototype.defaults),
  });

  return new TaskShapeClass();
}
