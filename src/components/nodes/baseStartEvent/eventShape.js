import { shapes, util } from 'jointjs';
import { markersMarkup, markersAttrs } from '@/mixins/hasMarkers';
import { docIconMarkup, docIconAttrs, docIconAdaptMarkup } from '@/mixins/documentingIcons';

export function getEventShape(forDocumenting = false) {
  let markup = [{
    tagName: 'circle',
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
  markersMarkup('bottomRight')];

  markup = docIconAdaptMarkup(markup, forDocumenting);

  const EventShape = shapes.standard.Circle.extend({
    markup,
    defaults: util.deepSupplement({
      size: { width: 36, height: 36 },
      attrs: {
        'image': { 'ref-x': 5, 'ref-y': 5, ref: 'circle', width: 26, height: 26 },
        ...docIconAttrs('doclabel', { 'ref-x': 26, 'ref-y': -4 }),
        ...docIconAttrs('doccircle', { 'cx': 30, 'cy': 5 }),
        ...markersAttrs('topLeft', { ref: 'circle', 'ref-y': -20, 'ref-padding-x': 0 }),
        ...markersAttrs('topCenter', { ref: 'circle', 'ref-y': -20 }),
        ...markersAttrs('topRight', { ref: 'circle', 'ref-x': 26, 'ref-y': -20, 'ref-padding-x': 0 }, -1),
        ...markersAttrs('bottomLeft', { ref: 'circle', 'ref-padding-x': 0, 'ref-padding-y': -40 }),
        ...markersAttrs('bottomCenter', { ref: 'circle', 'ref-padding-y': -40 }),
        ...markersAttrs('bottomRight', { ref: 'circle', 'ref-x': 26, 'ref-padding-x': 0, 'ref-padding-y': -40 }, -1),
      },

    }, shapes.standard.Circle.prototype.defaults),
  });
  return new EventShape();
}
