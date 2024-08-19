import { shapes, util } from 'jointjs';
import { docIconMarkup, docIconAttrs, docIconAdaptMarkup } from '@/mixins/documentingIcons';

export function getTextAnnotationShape(forDocumenting = false) {
  let markup = [
    docIconMarkup('doccircle'),
    docIconMarkup('doclabel'),
    ...shapes.standard.Polyline.prototype.markup,
  ];

  markup = docIconAdaptMarkup(markup, forDocumenting);

  const textAnnotationShape =  shapes.standard.Polyline.extend({
    markup,
    defaults: util.deepSupplement({
      attrs: {
        markup,
        ...docIconAttrs('doclabel', { 'ref-x': 0, 'ref-y': -4 }),
        ...docIconAttrs('doccircle', { 'cx': -8, 'cy': -8 }),
      },
    }, shapes.standard.Polyline.prototype.defaults),
  });

  const result = new textAnnotationShape();

  result.set('type', 'textAnnotation');

  return result;
}
